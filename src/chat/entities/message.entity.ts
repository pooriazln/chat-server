import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Chat } from './chat.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../user/entities/user.entity';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true })
  chat: Chat;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  text: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
