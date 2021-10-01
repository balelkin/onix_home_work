import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './interfaces/user.interfaces';

@Controller('user')
export class UserController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('getByEmail')
  getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('/:id')
  findById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
  @Post('/join-to-room')
  async joinToRoom(
    @Body('userId') userId: string,
    @Body('roomId') roomId: string,
  ) {
    return this.userService.joinToRoom(userId, roomId);
  }

  @Post('/leave-from-room')
  async leaveFromRoom(@Body('userId') userId: string): Promise<IUser> {
    return this.userService.leaveFromRoom(userId);
  }

  @Get('/room/:roomId')
  getAllUsersFromRoom(@Param('roomId') roomId: string): Promise<IUser[]> {
    return this.userService.getAllUsersFromRoom(roomId);
  }
}
