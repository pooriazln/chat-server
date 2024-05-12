import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IChatPayloadTypes, INewMessagePayload } from './types/payload.types';
import { WsGuard } from '../auth/guards/ws.guard';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(WsGuard)
export class ChatGateway implements NestGateway {
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('new-chat')
  handleNewChat(client: Socket, payload: IChatPayloadTypes) {
    return this.chatService.createChat(payload, client, this.server);
  }

  @SubscribeMessage('get-chats')
  handleGetChats(client: Socket) {
    return this.chatService.getChats(client);
  }

  @SubscribeMessage('get-chat')
  handleGetChat(client: Socket, username: string) {
    return this.chatService.getChat(client, username);
  }

  async handleConnection(socket: Socket) {
    const user = await this.chatService.getUser(socket);
    socket.join(`user_room_${user.id}`);
    await this.chatService.setOnlineStatus(true, socket);
  }

  handleDisconnect(socket: Socket) {
    socket.emit('update-chat', '');
    return this.chatService.setOnlineStatus(false, socket);
  }

  @SubscribeMessage('approve-chat')
  handleApproveChat(client: Socket, chatId: string) {
    return this.chatService.approve(this.server, chatId);
  }

  @SubscribeMessage('new-message')
  handleNewMessage(client: Socket, payload: INewMessagePayload) {
    return this.chatService.newMessage(this.server, client, payload);
  }
}
