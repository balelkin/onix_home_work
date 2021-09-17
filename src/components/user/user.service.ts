import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserEntity } from './entities/user.entity';
import { IUser } from './interfaces/user.interfaces';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoomService } from '../room/room.service';

@Injectable()
export class UserService {
  private readonly saltRound = 10;
  constructor(
    @InjectModel('User')
    private userRepository: Model<UserEntity>,
    private readonly roomService: RoomService,
  ) {}

  async getUserByEmail(email: string): Promise<IUser> {
    return this.userRepository.findOne({ email }).lean();
  }

  async create(user): Promise<IUser> {
    if (user.password) {
      const hash = await bcrypt.hash(user.password, 10);
      var createdUser = new this.userRepository(
        _.assignIn(user, { password: hash }),
      );
    } else {
      const userFromDB = await this.getUserByEmail(user.email);
      if (!userFromDB) {
        var createdUser = new this.userRepository(
          _.assignIn(
            user,
            { googleToken: user.accessToken },
            { token: user.token },
          ),
        );
      } else {
        this.userRepository.findOneAndUpdate(user.email, {
          googleToken: user.accessToken,
        });
        return user;
      }
    }

    return createdUser.save();
  }

  async findAll(): Promise<IUser> {
    return this.userRepository
      .find()
      .limit(20)
      .sort({ name: 1 })
      .populate('roomId')
      .lean();
  }

  async getById(id: string): Promise<IUser> {
    return this.userRepository.findById(id);
  }

  async remove(id: string): Promise<IUser> {
    const user = await this.getById(id);
    await this.roomService.leaveUserFromRoom(user.roomId, id);
    return this.userRepository.findByIdAndRemove(Types.ObjectId(id));
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    return this.userRepository.findByIdAndUpdate(
      Types.ObjectId(id),
      updateUserDto,
      {
        new: true,
      },
    );
  }

  async joinToRoom(userId: string, roomId: string) {
    const user = await this.getById(userId);
    if (user.roomId !== null) {
      await this.roomService.leaveUserFromRoom(user.roomId, userId);
    }
    await this.roomService.joinUserToRoom(roomId, userId);
    return this.userRepository.findByIdAndUpdate(
      Types.ObjectId(userId),
      { roomId: Types.ObjectId(roomId) },
      { new: true },
    );
  }

  async leaveFromRoom(userId: string): Promise<IUser> {
    const user = await this.getById(userId);
    await this.roomService.leaveUserFromRoom(user.roomId, userId);
    return this.userRepository.findByIdAndUpdate(Types.ObjectId(userId), {
      roomId: null,
    });
  }

  async getAllUsersFromRoom(roomId: string): Promise<IUser[]> {
    return this.userRepository
      .find({ roomId })
      .limit(20)
      .sort({ name: 1 })
      .populate('roomId')
      .lean();
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRound);
    return await bcrypt.hash(password, salt);
  }
  async removeAllUsersFromRoom(roomId: string) {
    return this.userRepository.updateMany(
      { roomId: Types.ObjectId(roomId) },
      { roomId: null },
      { new: true },
    );
  }
  async updatePassword(uId: string, password: string): Promise<boolean> {
    await this.userRepository.updateOne({ _id: uId }, { password });
    return true;
  }
}
