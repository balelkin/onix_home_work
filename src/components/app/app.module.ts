import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { MessageModule } from '../message/message.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import AppController from './app.controller';
import { ChatGateway } from '../chat/chat.gatewey';
import { TokenModule } from '../token/token.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV,
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),

    TokenModule,
    AuthModule,
    UserModule,
    RoomModule,
    MessageModule,
    MailModule,
  ],

  controllers: [AppController],
  providers: [AppService, ChatGateway],
  exports: [AppService],
})
export class AppModule {}
