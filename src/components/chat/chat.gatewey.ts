import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    } from '@nestjs/websockets';
import { ObjectId } from 'mongodb';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthService } from "src/components/auth/auth.service";
import { MessageService } from "src/components/message/message.service";
import { RoomService } from "src/components/room/room.service";
import { UserService } from '../user/user.service';



@WebSocketGateway()
export class ChatGateway implements OnGatewayInit{
constructor(
    private readonly messageService: MessageService, 
    private readonly roomService: RoomService,
    private readonly authService: AuthService, 
    private readonly userServise: UserService
){}


  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: any) {
    this.logger.log('SOCKET SOCKET initialized');
  }

  async handleDisconnect(client: Socket) {
    const roomId = this.getChatRoomId(client.handshake.headers.referer);
    const userId = this.getUserId(client.handshake.headers.cookie);

    await this.roomService.leaveUserFromRoom(roomId, userId);
    this.wss.to(roomId).emit('disconnectUser', userId);
  }

  async getUserId(cookie: string) {
    const separateCookies = cookie.split(';');
    const userPart = separateCookies.filter((i) => i.trim().slice(0, 11) === 'accessToken');
    const token = userPart[0].split('=')[1];
    const tokenPayload = await this.authService.getTokenPayload(token);

    return tokenPayload.uId;
  }

  getChatRoomId(url: string) {
    const splitUrl = url.split('/');
    return splitUrl[splitUrl.length - 2];
  }

  @SubscribeMessage('setUserRoom')
  async setUserRoom(client: Socket, data: { roomId: string, accessToken: string }) {
    const tokenPayload = await this.authService.getTokenPayload(data.accessToken);
    await this.roomService.joinUserToRoom(new ObjectId(data.roomId), tokenPayload.uId);
    client.join(data.roomId); 
    const messages = await this.messageService.getAllMessagesByRoom(data.roomId)
    this.wss.to(data.roomId).emit('addUser', { user: tokenPayload.uEmail, userId: tokenPayload.uId, text: messages});
  }

  @SubscribeMessage('clientToServer')
  async handleMessage(client: Socket, data: { text: string; accessToken: string; roomId: string; userId: string; name: string; avatar: string; email: string;}, ) {
    const tokenPayload = await this.authService.getTokenPayload(data.accessToken)
    const user = this.userServise.getUserByEmail(tokenPayload.email)
      
          
    await this.messageService.create({
      text: data.text,
      roomId: new ObjectId(data.roomId),
      ownerId: (await user)._id 

    });
    this.wss.to(data.roomId).emit('serverToClient', {
     
      text: data.text,
      name: data.name
         
    });
  }
}