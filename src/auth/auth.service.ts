import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from '../mail/mail.service';
import { HashPasswordService } from '../services/hashPassword';
import { User } from '../users/entities/users.entity';
import { UsersValidation } from '../users/entities/usersValidation.entity';
import { Repository } from 'typeorm';
import {
  createAccountInput,
  createAccountOutput,
  loginInput,
  loginOutput,
} from './auth.args';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UsersValidation)
    private readonly usersValidation: Repository<UsersValidation>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashPasswordService,
  ) {}

  async createAccount({
    email,
    password,
    role,
    firstName,
    lastName,
    mobile,
  }: createAccountInput): Promise<createAccountOutput> {
    try {
      const userExist = await this.users.find({where: { email, mobile }});
      if (userExist.length > 0) {
        throw new Error('User already exists');
      }
      const user = await this.users.save(
        this.users.create({
          email,
          password,
          role,
          firstName,
          lastName,
          mobile,
        }),
      );
      const verification = await this.usersValidation.save(
        this.usersValidation.create({ user }),
      );
      this.mailService.sendVerificationMail(user?.email, verification?.code);
      return {
        ok: true,
        message: 'Account created',
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  async login({ email, password }: loginInput): Promise<loginOutput> {
    try {
      // const user = await this.users.findOne(
      //   { email },
      //   { select: ['id', 'password'] },
      // );
      const user = await this.users.createQueryBuilder('user')
    .select(['user.id', 'user.password'])
    .where('user.email = :email', { email })
    .getOne();

      if (!user) {
        throw new Error('User does not exist');
      }
      const isValid = await this.hashService.comparehashPassword(
        password,
        user.password,
      );
      if (!isValid) {
        throw new Error('Email or Password is Wrong!');
      }

      const token = this.jwtService.generateToken({ id: user?.id });
      return {
        ok: true,
        message: 'User logged in successfully',
        token,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }
}
