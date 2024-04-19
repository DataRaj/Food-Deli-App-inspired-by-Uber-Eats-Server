import { InputType, OmitType } from '@nestjs/graphql';
import { User } from '../entities/users.entity';

@InputType()
export class addUserArgs extends OmitType(User, ['id'], InputType) {}
