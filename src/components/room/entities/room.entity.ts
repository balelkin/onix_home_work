import { Document, Types } from 'mongoose';

export class RoomEntity extends Document {
  readonly title: string;
  readonly ownerId: Types.ObjectId;
  readonly description: string;
  readonly usersId: Array<Types.ObjectId>;
}
