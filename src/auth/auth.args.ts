import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreArgs } from '../common/core.args';
import { User } from '../users/entities/users.entity';

@InputType()
export class createAccountInput extends PickType(User, [
  'password',
  'email',
  'role',
  'firstName',
  'lastName',
  'mobile',
]) {}

@ObjectType()
export class createAccountOutput extends CoreArgs {}

@InputType()
export class loginInput extends PickType(User, ['password', 'email']) {}

@ObjectType()
export class loginOutput extends CoreArgs {
  @Field(() => String, { nullable: true })
  token?: string;
}
