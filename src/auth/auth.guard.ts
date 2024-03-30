import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';
import { AllowedRoles } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();

    const token = gqlContext?.token;
    if (!token) {
      return false;
    }
    const decode = await this.jwtService.verifyToken(token);

    if (typeof decode === 'object' && decode.hasOwnProperty('id')) {
      const userId = decode['id'];

      const { user } = await this.usersService.findUser({ userId });

      if (!user) {
        return false;
      }
      gqlContext['user'] = user;
      if (roles.includes('Any')) {
        return true;
      }
      return roles.includes(user.role);
    }
  }
}
