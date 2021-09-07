import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Room } from 'src/components/room/schemas/room.schema';
import { User } from 'src/components/user/schema/user.schema';

export type MessageDocument = User & Document;

 @Schema({
  versionKey: false,
  timestamps: true,
  collection: 'messages',
})
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' })
  ownerId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Room' })
  roomId: Room;

  @Prop({ required: true })
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
