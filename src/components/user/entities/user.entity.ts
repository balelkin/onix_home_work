import { Document, Types } from 'mongoose';

export class UserEntity extends Document {
  readonly name?: string;
  readonly email?: string;
  readonly password?: string;
  readonly roomId?: Types.ObjectId;
  readonly avatar?: string;
  readonly googleToken?: string;
}
