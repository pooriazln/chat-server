import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User extends Document {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  profile_img: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  online: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  this.password = await hash(this.password, 10);
  next();
});
