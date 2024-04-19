import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from 'src/users/entities/users.entity';

export const AuthUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
export type AllowedRoles = keyof typeof UserRole | 'Any';
export const AuthorizeRole = (roles: AllowedRoles[]) =>
  SetMetadata('roles', roles);
  export const Role = (roles: string[]) => SetMetadata('roles', roles);