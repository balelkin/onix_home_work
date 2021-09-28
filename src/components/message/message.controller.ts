import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { IMessage } from './interfaces/message.interface';
import { UserData } from '../auth/decorators/user.decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('/create')
  async crete(
    @Body() createMessageDto: CreateMessageDto,
    @UserData('email') email: string,
  ) {}

  @Get('/by-room/:roomId')
  getAllMessagesByRoom(@Param() roomId): Promise<IMessage[]> {
    return this.messageService.getAllMessagesByRoom(roomId);
  }
}
