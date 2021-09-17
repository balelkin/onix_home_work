import { Body, Controller, Get, Header, HttpCode, Render } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';


@Controller()
export default class AppController {
  private start: number;

  constructor(
    private readonly authService: AuthService, 
  ) {
    this.start = Date.now();
  }
  @Get('/')
  @Render('index')
  getIndex (){}

  @Get('register')
  @Render('sign-up') 
  getRegister (){}
    
  @Get('login')
  @Render('login.hbs')
  getLogin (){}
  
 
 @Get('/forgotPassword')
 @Render('forgot-password')
 @HttpCode(201)
  async forgotPassword(){} 

  @Get('/changePassword')
  @Render('changePassword')
  changePassword() {
    return { title: 'change Password' };
  }
  
  @Get('healthcheck')
  async healthcheck() {
    const now = Date.now();
    return {
      status: 'Vibe API Online',
      uptime: Number((now - this.start) / 1000).toFixed(0),
    };
  }; 

 
}



