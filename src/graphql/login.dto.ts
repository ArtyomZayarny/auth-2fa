import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginResult {
  @Field()
  access_token: string;
}
