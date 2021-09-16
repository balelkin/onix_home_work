import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import moment = require('moment');
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IAuthLoginInput } from './interfaces/IAuthLoginInterface'
import { constants } from 'src/constants/jwt.constants';
import SignUpDto from './dto/sign.up.dto';
import { IUser } from '../user/interfaces/user.interfaces';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenService } from '../token/token.service';
import { ITokenPayload } from './interfaces/token-payload.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '../mail/mail.service';
import { CreateUserTokenDto } from '../token/dto/create.uToken.dto';
import { statusEnum } from '../user/enums/status.enum';
import { Request, Response } from 'express';
import { ISafeUser } from '../user/interfaces/safeUser.interface';
import SignInDto from './dto/sign.in.dto';
import * as _ from 'lodash';
import { ProtectedFieldsEnum } from '../user/enums/protected-fields.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private tokenService: TokenService, 
    private mailService: MailService,
    ) {}


  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException({ message: 'User with this email not found' });
    }
    const passwordCompared = await bcrypt.compare(pass, user.password);
    if (!passwordCompared) {
      throw new BadRequestException({ message: 'Password does not match' });
    }
    return true;
  }; 
  async signIn({ email, password }: SignInDto) {
    const user = await this.userService.getUserByEmail(email);
    
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await this.signUser(user);
      const safeUser = user as ISafeUser;
      safeUser.accessToken = token;
     
      return _.omit(safeUser, Object.values(ProtectedFieldsEnum));
    }
    throw new NotFoundException('user not found');
  }
  
  private async decodeToken(token: string): Promise<IUser> {
    const decodeToken = this.jwtService.decode(token) as IUser;
    if (!decodeToken) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Token is invalid',
      });
    }
    return decodeToken;
  }
  
async signInByToken(token: string) {
    const decodetToken = await this.decodeToken(token);
    
    const payload = {
      email: decodetToken.email,
    };

    const userFromDB = await this.userService.getUserByEmail(payload.email);
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: constants.jwt.expirationTime.accessTokenExpirationTime,
      secret: constants.jwt.secret,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: constants.jwt.expirationTime.refreshTokenExpirationTime,
      secret: constants.jwt.secret,
    });
    
    return {
      user: userFromDB,
      accessToken,
      refreshToken,
    };
  }

  async register(user: SignUpDto) {
    const newUser = await this.userService.create(user);
    await this.sendConfirmation(newUser)
    return true;
  };
  
  async getTokenPayload(token: string){
    return await this.jwtService.verify(token);
  }
  
  async forgotPassword({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) throw new BadRequestException('Wrong email');
    const token = await this.signUser(user);
    const changePasswordLink = `${process.env.FE_APP_URL}changePassword?token=${token}`;
      
      await this.mailService.sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Change password link',
      html: `
        <h3>Hello</h3>
        <p>please use <a href="${changePasswordLink}">this link</a> to change your password ${token}</p>
      `,
    });
  }
  
  async changePassword({ password, token }: ChangePasswordDto): Promise<boolean> {
    const tokenPayload = await this.verifyToken(token);
    const newPassword = await this.userService.hashPassword(password);

    await this.userService.updatePassword(tokenPayload.uId, newPassword);
    await this.tokenService.deleteAll(tokenPayload.uId);
    return true;
  }
  
  async login(user: IAuthLoginInput) {
    const payload = { email: user.email, uId: user._id };
    const userFromDB = await this.userService.getUserByEmail(user.email);
    if (userFromDB) {
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: constants.jwt.expirationTime.accessTokenExpirationTime, 
        secret: constants.jwt.secret
      });
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: constants.jwt.expirationTime.refreshTokenExpirationTime, 
        secret: constants.jwt.secret
      });

      return {
    
     user: userFromDB, 
     accessToken, 
     refreshToken
    };
    } else {
      throw  new NotFoundException ({message: 'User not found'})
    }
    
  }
  async verifyToken(token: string): Promise<ITokenPayload> {
    const tokenPayload = this.jwtService.verify(token);
    const tokenExist = await this.tokenService.exist(tokenPayload.uId, token);
    if (tokenExist) {
      return tokenPayload;
    }
    throw new UnauthorizedException();
  }

  async signUser(user: IUser, withStatusCheck = true): Promise<string> {
    if (withStatusCheck && user.status !== statusEnum.active) {
      throw new BadRequestException('Wrong user status');
    }

    const tokenPayload: ITokenPayload = {
      uId: user._id,
      uStatus: user.status,
      uEmail: user.email,
    };

    const token = await this.generateToken(tokenPayload);
    const expireAt = moment().add(1, 'day').toISOString();


    await this.saveToken({
      token,
      expireAt,
      uId: user._id,
    });
    return token;
  }
  
  async generateToken(tokePayload: ITokenPayload): Promise<string> {
    return this.jwtService.sign(tokePayload);
  }

  async saveToken(createUserTokenDto: CreateUserTokenDto) {
    return this.tokenService.create(createUserTokenDto);
  }
  async logout(token: string) {
    const tokenPayload = await this.getTokenPayload(token);
       
    return this.tokenService.deleteAll(tokenPayload.uId);
  }
  
  async confirm (token: string): Promise<IUser> {
    const data = await this.getTokenPayload(token); 
    const user = await this.userService.getById(data.uId)
    await this.tokenService.delete(data.uId, token);
    if (user && user.status === statusEnum.pending){
      user.status = statusEnum.active
      return user.save()
    }
    throw new BadRequestException('Confirmation error ')
  } 

  async sendConfirmation(user: IUser){
    const expiresIn = 60*60*24
    const tokenPayload: ITokenPayload = {
      uId: user._id,
      uStatus: user.status,
      uEmail: user.email,
    };
    const expireAt = moment().add(1, 'day').toISOString()
    const token = await this.generateToken(tokenPayload)
    const confirmLink = `${process.env.FE_APP_URL}auth/confirmEmail?token=${token}`;
      await this.saveToken({token, uId: user._id, expireAt})
      await this.mailService.sendEmail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify user',
      html: `
        <h3>Hello ${user.name }</h3>
        <p>please use <a href="${confirmLink}">this link</a> to confirm your password ${token}</p>
      `,
    });
  }

}
