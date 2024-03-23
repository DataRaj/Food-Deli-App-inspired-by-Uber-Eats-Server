import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreArgs } from './core.args';
@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;
}
@ObjectType()
export class PaginationOutput extends CoreArgs {
  @Field(() => Int, { nullable: true })
  totalPages?: number;
}
