import { registerEnumType } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { UsersValidation } from './entities/usersValidation.entity';
import { UsersService } from './users.service';
enum UserRole {
  Owner = 'OWNER',
  Client = 'CLIENT',
  Delivery = 'DELIVERY',
}
registerEnumType(UserRole, { name: 'UserRole' });
const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});
const mockMailService = {
  sendVerificationMail: jest.fn(() => Promise.resolve()),
};
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let users: MockRepository<User>;
  let usersValidation: MockRepository<UsersValidation>;
  let mailService: MailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(UsersValidation),
          useValue: mockRepository(),
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    mailService = module.get<MailService>(MailService);
    service = module.get<UsersService>(UsersService);
    users = module.get(getRepositoryToken(User));
    usersValidation = module.get(getRepositoryToken(UsersValidation));
  });

  describe('findUser', () => {
    const user = {
      id: 1,
    };
    it('findUser should fail if user not found', async () => {
      users.findOneOrFail.mockRejectedValue(undefined);
      const result = await service.findUser({ userId: user.id });
      expect(users.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(users.findOneOrFail).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toMatchObject({
        ok: false,
        message: 'User does not exist',
      });
    });
    it('findUser should pass if user found', async () => {
      users.findOneOrFail.mockResolvedValue(user);
      const result = await service.findUser({ userId: user.id });
      expect(users.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(users.findOneOrFail).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toMatchObject({
        ok: true,
        message: 'User profile found',
        user,
      });
    });
  });

  describe('updateUser', () => {
    const user = {
      id: 1,
      password: '',
      email: '',
      role: UserRole.Client,
      verified: true,
      hashingPassword: jest.fn(() => Promise.resolve()),
    };
    const newUser = {
      password: '',
      email: 'mock@yahoo.com',
      role: UserRole.Owner,
    };
    const validUser = {
      code: 'mock1234',
    };

    it('updateUser should fail if user not found', async () => {
      users.findOne.mockResolvedValue(undefined);
      const result = await service.updateUser(user, newUser);
      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(users.findOne).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toMatchObject({
        ok: false,
        message: 'User does not exist',
      });
    });

    it('updateUser should pass if user found', async () => {
      users.findOne.mockResolvedValue(user);
      usersValidation.create.mockReturnValue(validUser);
      usersValidation.save.mockResolvedValue(validUser);
      const result = await service.updateUser(user, newUser);
      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(users.findOne).toHaveBeenCalledWith(expect.any(Number));
      expect(usersValidation.create).toHaveBeenCalledTimes(1);
      expect(usersValidation.create).toHaveBeenCalledWith({ user });
      expect(usersValidation.save).toHaveBeenCalledTimes(1);
      expect(usersValidation.save).toHaveBeenCalledWith(validUser);
      expect(mailService.sendVerificationMail).toHaveBeenCalledWith(
        user.email,
        validUser.code,
      );
      expect(result).toMatchObject({
        ok: true,
        message: 'User Updated Successfully',
      });
    });
  });
});
