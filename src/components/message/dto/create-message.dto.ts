import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @IsNotEmpty()
  ownerId: Types.ObjectId;

  @IsNotEmpty()
  roomId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  text: string;
}
