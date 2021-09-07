import { Document } from 'mongoose';

export class IMessage extends Document {
  readonly text: string;
  readonly userId: string;
  readonly roomId: string;
  readonly createdAt: string;
}
