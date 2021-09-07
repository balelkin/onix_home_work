import { Injectable } from '@nestjs/common';
import { CreateUserTokenDto } from './dto/create.uToken.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserToken } from './interfaces/user.token.interfaces';

@Injectable()
export class TokenService {
  constructor(@InjectModel('Token') private readonly tokenModel: Model<IUserToken> ) {
  }
  async create(createUserTokenDto: CreateUserTokenDto): Promise<IUserToken> {
    return new this.tokenModel(createUserTokenDto).save();
  }

  async delete(uId: string, token: string) {
    return this.tokenModel.deleteOne({ uId, token });
  }

  async deleteAll(uId: string) {
    return this.tokenModel.deleteMany({ uId });
  }

  async exist(uId: string, token: string) {
    return this.tokenModel.exists({ uId, token });
  }

  async existByToken(token: string): Promise<boolean> {
    return this.tokenModel.exists({ token });
  }
}
