import { Types } from 'mongoose';

export class CreateMessageDto {
  ownerId: Types.ObjectId;
  roomId: Types.ObjectId;
  text: string;
}
