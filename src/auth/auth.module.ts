import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { UsersValidation } from '../users/entities/usersValidation.entity';
import { HashPasswordService } from 'src/services/hashPassword';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UsersValidation])],
  providers: [
    AuthService,
    UsersService,
    AuthResolver,
    HashPasswordService,

    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
