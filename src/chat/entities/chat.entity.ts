import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../user/entities/user.entity';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Message } from './message.entity';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ default: false })
  is_approved: boolean;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Message',
    required: true,
  })
  messages: Message[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
