import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './entities/chat.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './entities/message.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import { IChatPayloadTypes, INewMessagePayload } from './types/payload.types';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getUser(socket: Socket) {
    const id = this.extractToken(socket);
    return this.userModel.findById(id.sub);
  }

  extractToken(socket: Socket): { sub: string } {
    return this.jwtService.verify(
      socket.handshake.headers.authorization.split(' ')[1],
      { secret: this.configService.getOrThrow('JWT_SECRET') },
    );
  }

  async createChat(
    payload: IChatPayloadTypes,
    client: Socket,
    server: Server,
  ): Promise<any> {
    const receiverUser = await this.userModel.findOne({
      username: payload.username,
    });

    if (!receiverUser) {
      return { error: 'no user found with provided username' };
    }

    const creatorId = this.extractToken(client);
    const creatorUser = await this.userModel.findById(creatorId.sub);

    const chatExist = await this.chatModel.findOne({
      user: receiverUser.id,
      creator: creatorUser,
    });

    if (chatExist) return { error: 'chat already exists' };

    const chat = await this.chatModel.create({
      creator: creatorUser,
      user: receiverUser,
      is_approved: false,
    });

    const message = await this.messageModel.create({
      chat,
      user: creatorUser,
      text: payload.text,
    });

    await chat.updateOne({
      messages: [message],
    });

    const data = {
      chat: { ...chat.toJSON(), messages: [message], creator: creatorUser },
    };

    console.log(data);

    server.to(`user_room_${receiverUser.id}`).emit('new_chat', data);

    return { data };
  }

  async getChats(client: Socket) {
    const userId = this.extractToken(client);
    const user = await this.userModel.findById(userId.sub);

    const data = await this.chatModel
      .find({
        $or: [{ creator: user.id }, { user: user.id }],
      })
      .limit(50)
      .populate('user')
      .populate('creator')
      .populate('messages')
      .exec();

    for (const chat of data) {
      await client.join(`chat_room_${chat.id}`);
    }

    return { data };
  }

  async setOnlineStatus(online: boolean, socket: Socket) {
    const userId = this.extractToken(socket);
    const user = await this.userModel.findById(userId.sub);
    await user.updateOne({ online });
  }

  async getChat(client: Socket, username: string) {
    const creator = await this.userModel.findOne({
      username,
    });

    let chat = await this.chatModel
      .findOne({
        creator: creator.id,
      })
      .populate('creator')
      .populate('user')
      .populate({
        path: 'messages',
        populate: {
          path: 'user',
          model: 'User',
        },
      })
      .exec();

    if (!chat) {
      chat = await this.chatModel
        .findOne({
          user: creator.id,
        })
        .populate('creator')
        .populate('user')
        .populate({
          path: 'messages',
          populate: {
            path: 'user',
            model: 'User',
          },
        });
    }

    await client.join(`chat_room_${chat.id}`);
    return { data: chat };
  }

  async approve(server: Server, chatId: string) {
    const chat = await this.chatModel
      .findById(chatId)
      .populate('creator')
      .populate('user')
      .populate('messages');

    await chat.updateOne({ is_approved: true });

    server
      .to(`chat_room_${chat.id}`)
      .emit('update-chat', { chat: { ...chat.toJSON(), is_approved: true } });

    return true;
  }

  async newMessage(
    server: Server,
    client: Socket,
    payload: INewMessagePayload,
  ) {
    const userId = this.extractToken(client);
    const chat = await this.chatModel.findById(payload.chatId);
    const user = await this.userModel.findById(userId.sub);
    const message = await this.messageModel.create({
      chat,
      user,
      text: payload.text,
    });

    await chat.updateOne({
      $push: {
        messages: message,
      },
    });

    server.to(`chat_room_${chat.id}`).emit('new-message', { message });
    return true;
  }
}
