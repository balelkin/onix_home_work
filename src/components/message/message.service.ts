import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';

import { CreateMessageDto } from './dto/create-message.dto';
import { IMessage } from './interfaces/message.interface';
import { ObjectId } from 'mongodb';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageRepository: Model<IMessage>,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    return new this.messageRepository(createMessageDto).save();
  }

  async getAllMessagesByRoom(roomId: string): Promise<IMessage[]> {
      return this.messageRepository
      .find({ roomId })
      .sort({ createdAt: -1 })
      .populate('ownerId')
      .populate('roomId')
      .lean();
  }
  
  async getById(id: string): Promise<IMessage> {
    return this.messageRepository
      .findById(Types.ObjectId(id))
      .populate('ownerId')
      .populate('roomId')
      .lean();
  }
}
