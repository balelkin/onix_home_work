import { ObjectId } from 'mongoose';

export class ISafeUser {
  _id: string;
  email: string;
  accessToken?: string;
}
