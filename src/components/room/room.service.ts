import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomEntity } from './entities/room.entity';
import { IRoom } from './interfaces/room.interfaces';

@Injectable()
export class RoomService {
  constructor(@InjectModel('Room') private roomRepository: Model<RoomEntity>){}
  
  create(createRoomDto: CreateRoomDto) {
    return this.roomRepository.create(createRoomDto)
  }

  async findAll(): Promise<IRoom> {
    return this.roomRepository
    .find()
    .limit(20)
    .sort({ name: 1 })
    .populate('ownerId')
    .lean();
  }

   async getById(id: string): Promise<IRoom>{
    return this.roomRepository
    .findById(Types.ObjectId(id))
    .populate('ownerId')
    .lean();
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<IRoom> {
    return this.roomRepository.findByIdAndUpdate(
      Types.ObjectId(id), 
      updateRoomDto, 
      {new: true});
  }

  async remove(id: string): Promise<IRoom> {
    return this.roomRepository.findByIdAndRemove(Types.ObjectId(id));
  }

  async getAllRoomsByUser(ownerId: string): Promise<IRoom[]>{
    return this.roomRepository
    .find({ ownerId })
    .limit(10)
    .sort({ title: 1 })
    .populate('ownerId')
    .lean()
  }
  
  async leaveUserFromRoom(roomId, usersId) {
    return this.roomRepository.findByIdAndUpdate(
      { _id: roomId },
      { $push: { connectedUsers: usersId } },
    );
  };

  async joinUserToRoom(roomId, userId) {
    return this.roomRepository.findByIdAndUpdate(
      Types.ObjectId(roomId),
      { $addToSet: { usersId: Types.ObjectId(userId) } },
      { new: true },
    );
  }
  
  async getUsersByRoomId(roomId) {
    const users = await this.roomRepository.findById({roomId}).populate('usersId').lean()
       
    return users[0].users;
  }
}

