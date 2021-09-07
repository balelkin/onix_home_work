import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { IMessage } from './interfaces/message.interface';
import { UserService } from '../user/user.service';
import { UserData } from '../auth/decorators/user.decorator';
import { IsEmail } from 'class-validator';
import { User } from '../user/schema/user.schema';
import { Cookies } from '../auth/decorators/cookies.decorator';


@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService, private readonly userService: UserService) {
  }

  @Post('/create')
  async crete(@Body() createMessageDto: CreateMessageDto, @Cookies('email') email: string) {
    // const user = await this.userService.getUserByEmail(email)
    // console.log(user);
    
    console.log(createMessageDto);
    console.log('email: ', email);
    
    
    //return await this.messageService.create(createMessageDto);
  }

  @Get('/by-room/:roomId')
  getAllMessagesByRoom(@Param() roomId): Promise<IMessage[]> {
    return this.messageService.getAllMessagesByRoom(roomId);
  }
}