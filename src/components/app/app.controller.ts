import { Controller, Get, Render } from '@nestjs/common';


@Controller()
export default class AppController {
  private start: number;

  constructor() {
    this.start = Date.now();
  }
  @Get()
  @Render('index')
  getIndex (){}

  @Get('register')
  @Render('sign-up') 
  getRegister (){}
    
  @Get('login')
  @Render('login.hbs')
  getLogin (){}

  @Get('healthcheck')
  async healthcheck() {
    const now = Date.now();
    return {
      status: 'Vibe API Online',
      uptime: Number((now - this.start) / 1000).toFixed(0),
    };
  }; 

 
}



