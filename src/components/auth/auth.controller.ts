import { Controller, Get, Post, Request, Inject, forwardRef, UseGuards, Body, HttpCode, Req, Redirect, Res, Render, Query, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import SignInDto from './dto/sign.in.dto';
import SignUpDto from './dto/sign.up.dto';
import { GoogleAuthGuard }  from './guards/google.auth.guard';
import LocalAuthGuard from './guards/local.auth.guard';

import JwtAuthGuard from './guards/jwt-auth.guard';
import RefreshTokenDto from './dto/RefreshToken.dto';
import { constants } from 'src/constants/jwt.constants';
import { UserData } from './decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';



@Controller('auth')
export class AuthController {
  constructor(
     private readonly authService: AuthService, 
     private readonly jwtService: JwtService
     ) {}
  
     @Get('google')
     @UseGuards(GoogleAuthGuard)
     async googleAuth(@Req() req) {

     }
   
     @Get('google/callback')
     @UseGuards(GoogleAuthGuard)
     @Redirect('/room')
     async googleAuthRedirect(@Req() req, @UserData() data) {
       console.log(data);
       return this.authService.googleLogin(req)
     }
     
  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  @HttpCode(200)
  @Redirect('/room')
  async signIn(@Body() signIn: SignInDto, @Res() res, @UserData() user: UserEntity) { 
   const dataForLogit = await this.authService.login(signIn);
   res.cookie('accessToken', dataForLogit.accessToken);
   res.cookie('refreshToken', dataForLogit.refreshToken)
   res.cookie('userAvatar', dataForLogit.user.avatar)
   res.cookie('userName', dataForLogit.user.name)
   res.cookie('userEmail', dataForLogit.user.email)

  //  console.log("user: ", user, "dataForLogit", dataForLogit);
  //  const userAvatar = dataForLogit.user.avatar
  // //const userName = user.email
  //  //console.log(userName);
   
   return true;
  }

@UseGuards(JwtAuthGuard)
@Get('/user-room')
@Render('room.hbs')
@HttpCode(200)
getRoom (@Request() req){
  
  return {
    user: req.user 
  }
}

  
  
  @Get('/sign/in/by/token')
  @HttpCode(200)
  async signInByToken(@Query('token') token: string) {
    return this.authService.signInByToken(token);
  }

  @Post('sign-up')
  @Render('rooms.hbs')
  @HttpCode(201)
  async signUp(@Body() userData: SignUpDto) {
    const email = userData.email.toLocaleLowerCase();
    const user = userData;
    user.email = email;
    return this.authService.register(user).then((newUser) => {
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
}


  