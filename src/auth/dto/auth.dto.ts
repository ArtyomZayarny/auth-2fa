import { Field, InputType } from '@nestjs/graphql';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

@InputType()
export class AuthDto {
  @IsString()
  @Field()
  email: string;

  @Field()
  @IsString()
  password: string;

  @IsOptional()
  @Field({ defaultValue: null })
  @IsNumberString()
  tfaCode?: string;
}
