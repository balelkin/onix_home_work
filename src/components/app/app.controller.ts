import { Controller, Get, HttpCode, Render } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Controller()
export default class AppController {
  private start: number;

  constructor(private readonly authService: AuthService) {
    this.start = Date.now();
  }
  @Get('/')
  @Render('index')
  getIndex() {}

  @Get('register')
  @Render('sign-up')
  getRegister() {}

  @Get('login')
  @Render('login.hbs')
  getLogin() {}

  @Get('/forgotPassword')
  @Render('forgot-password')
  @HttpCode(201)
  async forgotPassword() {}

  @Get('/changePassword')
  @Render('change-password')
  changePassword() {
    return { title: 'change Password' };
  }
}
