import { User, UserSchema } from '../user/entities/user.entity';
import { Chat, ChatSchema } from '../chat/entities/chat.entity';
import { Message, MessageSchema } from '../chat/entities/message.entity';

export const databaseModels = [
  { name: User.name, schema: UserSchema },
  { name: Chat.name, schema: ChatSchema },
  { name: Message.name, schema: MessageSchema },
];
