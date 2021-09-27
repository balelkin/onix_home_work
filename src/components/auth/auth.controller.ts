import {
  Controller,
  Get,
  Post,
  Inject,
  forwardRef,
  UseGuards,
  Body,
  HttpCode,
  Req,
  Redirect,
  Res,
  Render,
  Query,
  ForbiddenException,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import SignInDto from './dto/sign.in.dto';
import SignUpDto from './dto/sign.up.dto';
import LocalAuthGuard from './guards/local.auth.guard';
import JwtAuthGuard from './guards/jwt-auth.guard';
import RefreshTokenDto from './dto/RefreshToken.dto';
import { constants } from 'src/constants/jwt.constants';
import { UserData } from './decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { query } from 'express';
import { ConfirmAccountDto } from './dto/confirmAccountDto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  @HttpCode(200)
  @Redirect('/room')
  async signIn(
    @Body() signIn: SignInDto,
    @Res() res,
    @UserData() user: UserEntity,
  ) {
    const { accessToken } = await this.authService.signIn(signIn);

    const dataForLogit = await this.authService.login(signIn);
    res.cookie('accessToken', dataForLogit.accessToken);
    res.cookie('refreshToken', dataForLogit.refreshToken);
    res.cookie('avatar', dataForLogit.user.avatar);
    res.cookie('name', dataForLogit.user.name);
    res.cookie('id', dataForLogit.user._id)

    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user-room')
  @Render('room.hbs')
  @HttpCode(200)
  getRoom(@Req() req) {
    return {
      user: req.user,
    };
  }

  @Get('/sign/in/by/token')
  @HttpCode(200)
  async signInByToken(@Query('token') token: string) {
    return this.authService.signInByToken(token);
  }

  @Post('sign-up')
  @Render('confirmEmail')
  @HttpCode(201)
  async signUp(@Body() userData: SignUpDto) {
    const email = userData.email.toLocaleLowerCase();
    const user = userData;
    user.email = email; 
    return await this.authService.register(user).then((newUser) => {
     console.log('1111', newUser);
     return {
        message: 'User was created successfully.',
        user: newUser,
      };
    });
  }

  @Post('refreshToken')
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const verifiedUser = this.jwtService.verify(refreshTokenDto.refreshToken, {
      secret: constants.jwt.secret,
    });
    if (!verifiedUser) {
      throw new ForbiddenException();
    }
    const payload = {
      id: verifiedUser.id,
      email: verifiedUser.email,
      name: verifiedUser.name,
    };
  }

  @Post('/forgotPassword')
  @Render('confirmEmail')
  @Redirect('/changePassword')
  @HttpCode(201)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Redirect('./changePassword')
  @Patch('/changePassword')
  @Render('changePassword')
  @HttpCode(201)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Get('/confirmEmail')
  @Render('login')
  async confirm(@Query(ValidationPipe) query: ConfirmAccountDto) {
    await this.authService.confirm(query.token);
  }

  @Get('/logout')
  @Render('index')
  async logout(@Req() req: Request) {
    return this.authService.logout(req.cookies.accessToken);
  }
}
