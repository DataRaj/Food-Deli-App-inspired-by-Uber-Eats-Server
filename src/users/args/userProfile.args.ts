import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreArgs } from '../../common/core.args';
import { User } from '../entities/users.entity';

@ArgsType()
export class UserProfileInput {
  @Field()
  userId: number;
}
@ObjectType()
export class UserProfileOutput extends CoreArgs {
  @Field(() => User, { nullable: true })
  user?: User;
}
