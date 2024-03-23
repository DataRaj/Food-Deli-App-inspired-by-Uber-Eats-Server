import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IJwt } from './jwt.interface';

@Injectable()
export class JwtService {
  static OPTION_JWT: any;
  constructor(@Inject('JWT') private readonly params: IJwt) {}
  generateToken(payload) {
    return jwt.sign(payload, this.params.JWT_SECRET);
  }
  verifyToken(token) {
    try {
      return jwt.verify(token, this.params.JWT_SECRET);
    } catch (error) {
      return error.message;
    }
  }
  findToken(authorization) {
    console.log(authorization);
    // const [bearer, token] = authorization.split(' ');
    // if (!token) {
    // 	return false;
    // }
    return authorization;
  }
}
