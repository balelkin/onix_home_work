import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'tokens',
})
export class Token {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, ref: 'User' })
  uId: Types.ObjectId;

  @Prop({ required: false })
  expireAt: Date;
}
export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.index({ token: 1 }, { unique: true });
