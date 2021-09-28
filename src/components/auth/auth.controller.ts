import {
  Controller,
  Get,
  Post,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmAccountDto } from './dto/confirmAccountDto';
import { Request } from 'express';
import { UserData } from './decorators/user.decorator';

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
  async signIn(@Body() signIn: SignInDto, @Res() res) {
    const dataForLogit = await this.authService.login(signIn);

    res.cookie('accessToken', dataForLogit.accessToken);
    res.cookie('refreshToken', dataForLogit.refreshToken);
    res.cookie('avatar', dataForLogit.user.avatar);
    res.cookie('name', dataForLogit.user.name);
    res.cookie('id', dataForLogit.user._id);

    return { title: 'Sign-in' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user-room')
  @Render('room.hbs')
  @HttpCode(200)
  getRoom(@UserData() user) {
    return {
      user: user,
    };
  }

  @Post('sign-up')
  @Render('confirm-email')
  @HttpCode(201)
  async signUp(@Body() user: SignUpDto) {
    return this.authService.register(user).then((newUser) => {
      return {
        message: 'User was created successfully.',
        user: newUser,
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('refreshToken')
  @HttpCode(200)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const verifiedUser = await this.jwtService.verify(
      refreshTokenDto.refreshToken,
      {
        secret: constants.jwt.secret,
      },
    );

    if (!verifiedUser) {
      throw new ForbiddenException();
    }

    const payload = {
      id: verifiedUser.id,
      email: verifiedUser.email,
      name: verifiedUser.name,
    };

    return payload;
  }

  @Post('/forgotPassword')
  @Render('confirm-email')
  @HttpCode(201)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Patch('/changePassword')
  @HttpCode(201)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    console.log(changePasswordDto);

    return this.authService.changePassword(changePasswordDto);
  }

  @Get('/confirmEmail')
  @Redirect('./login')
  async confirm(@Query(ValidationPipe) query: ConfirmAccountDto) {
    await this.authService.confirm(query.token);
  }

  @Get('/logout')
  @Render('index')
  async logout(@Req() req: Request) {
    return this.authService.logout(req.cookies.refreshToken);
  }
}
