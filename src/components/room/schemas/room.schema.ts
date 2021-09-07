import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/components/user/schema/user.schema';


export type RoomDocument = Room & Document;

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'rooms',
})
export class Room {

  @Prop({ required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  ownerId: User;

  @Prop({ default: null })
  description: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  usersId: User[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
