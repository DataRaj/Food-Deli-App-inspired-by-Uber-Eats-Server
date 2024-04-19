import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { UsersValidation } from './entities/usersValidation.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UsersValidation])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
