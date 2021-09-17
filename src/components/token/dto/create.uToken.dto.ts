import { Types } from 'mongoose';

export class CreateUserTokenDto {
  token: string;
  uId: Types.ObjectId;
  expireAt: string;
}
