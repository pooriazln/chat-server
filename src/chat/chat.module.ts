import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { databaseModels } from '../database/database.models';
import { ChatService } from './chat.service';

@Module({
  imports: [MongooseModule.forFeature(databaseModels)],
  providers: [ChatGateway, JwtService, UserService, ChatService],
})
export class ChatModule {}
