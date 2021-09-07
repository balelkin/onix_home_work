import { Types } from 'mongoose';

export interface IMessage {
  readonly _id?: string;
  readonly ownerId: Types.ObjectId;
  readonly roomId: Types.ObjectId;
  readonly text: string;
}
