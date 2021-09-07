import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IAuthLoginInput } from './interfaces/IAuthLoginInterface'
import { constants } from 'src/constants/jwt.constants';
import SignUpDto from './dto/sign.up.dto';
import { IUser } from '../user/interfaces/user.interfaces';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
    ) {}

  async googleLogin(req) {
  if (!req.user) {
    return 'No user from google'
  }
  this.userService.create(req.user)
  return {
    message: 'User information from google',

    user: req.user
  }
  }
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
    // await this.redisClient.set(payload.phone, refreshToken, 'EX', 86400);
    return {
      user: userFromDB,
      accessToken,
      refreshToken,
    };
  }

  async register(user: SignUpDto) {
    const newUser = await this.userService.create(user);
    return newUser;
  };
  
  async getTokenPayload(token: string){
    return await this.jwtService.verify(token);
  }
  
  async login(user: IAuthLoginInput) {
    const payload = { email: user.email };
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
}
