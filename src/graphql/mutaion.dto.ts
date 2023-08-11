import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationResult {
  @Field({ nullable: true })
  success?: boolean;

  @Field({ nullable: true })
  error?: boolean;
}

@ObjectType()
export class GenerateQrCodeResult {
  @Field()
  qrCodePath: string;
}
