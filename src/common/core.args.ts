import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreArgs {
  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Boolean)
  ok: boolean;
}
