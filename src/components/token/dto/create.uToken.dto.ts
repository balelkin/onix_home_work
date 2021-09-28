import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  uId: Types.ObjectId;

  expireAt: string;
}
