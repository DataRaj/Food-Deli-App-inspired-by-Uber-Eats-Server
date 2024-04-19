import { Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from './jwt.service';
@Injectable()
export class JwtMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      try {
        const decode = await this.jwtService.verifyToken(token);
        if (typeof decode === 'object' && decode.hasOwnProperty('id')) {
          const userId = decode['id'];

          const { user } = await this.usersService.findUser({ userId });

          req['user'] = user;
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    next();
  }
}
