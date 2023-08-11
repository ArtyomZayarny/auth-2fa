import { ObjectType } from '@nestjs/graphql';
import { prop } from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export interface User extends Base {}

@ObjectType()
export class User extends TimeStamps {
  @prop({ unique: true })
  email: string;

  @prop()
  passwordHash: string;

  @prop({ default: false })
  isTfaEnabled: boolean;

  @prop({ default: null })
  tfaSecret: string;
}
