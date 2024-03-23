import { registerEnumType } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { HashPasswordService } from 'src/services/hashPassword';
import { User } from 'src/users/entities/users.entity';
import { UsersValidation } from 'src/users/entities/usersValidation.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

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
});
const mockMailService = {
  sendVerificationMail: jest.fn(),
};

const mockJwtService = {
  generateToken: jest.fn(({ id }) => id + 'mockToken'),
};

const mockHashService = {
  comparehashPassword: jest.fn(() => Promise.resolve(false)),
};
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('AuthService', () => {
  let service: AuthService;
  let mailService: MailService;
  let jwtService: JwtService;
  let users: MockRepository<User>;
  let usersValidation: MockRepository<UsersValidation>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashPasswordService,
          useValue: mockHashService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    users = module.get(getRepositoryToken(User));
    usersValidation = module.get(getRepositoryToken(UsersValidation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const user = {
      email: 'mock@gmail.com',
      password: 'mock1234',
      role: UserRole.Owner,
    };
    const validUser = {
      code: 'mock1234',
    };
    it('should fail if user exists', async () => {
      users.findOne.mockReturnValue(user);
      const result = await service.createAccount(user);
      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(users.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toMatchObject({
        ok: false,
        message: 'User already exist',
      });
    });
    it('should create new user', async () => {
      users.findOne.mockReturnValue(undefined);
      users.create.mockReturnValue(user);
      users.save.mockReturnValue(user);
      usersValidation.create.mockReturnValue(validUser);
      usersValidation.save.mockReturnValue(validUser);
      const result = await service.createAccount(user);
      expect(users.create).toHaveBeenCalledTimes(1);
      expect(users.create).toHaveBeenCalledWith(user);
      expect(users.save).toHaveBeenCalledTimes(1);
      expect(users.save).toHaveBeenCalledWith(user);
      expect(usersValidation.create).toHaveBeenCalledTimes(1);
      expect(usersValidation.create).toHaveBeenCalledWith({ user });
      expect(usersValidation.save).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationMail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toMatchObject({
        ok: true,
        message: 'Account created',
      });
    });
    it('should fail on any execption', async () => {
      users.findOne.mockRejectedValue(new Error('mock error'));
      const result = await service.createAccount(user);
      expect(result).toMatchObject({
        ok: false,
        message: expect.any(String),
      });
    });
  });
  describe('login', () => {
    const user = {
      id: 1,
      email: '',
      password: 'mock1234',
    };
    it('should fail if user does not exist', async () => {
      users.findOne.mockReturnValue(undefined);
      const result = await service.login(user);
      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(users.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toMatchObject({
        ok: false,
        message: 'User does not exist',
      });
    });

    it('should fail if password is not valid', async () => {
      users.findOne.mockReturnValue(user);
      mockHashService.comparehashPassword.mockReturnValue(
        Promise.resolve(false),
      );
      const result = await service.login(user);
      expect(mockHashService.comparehashPassword).toHaveBeenCalledTimes(1);
      expect(mockHashService.comparehashPassword).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toMatchObject({
        ok: false,
        message: 'Email or Password is Wrong!',
      });
    });

    it('should return token if password is valid', async () => {
      users.findOne.mockResolvedValue(user);
      mockHashService.comparehashPassword.mockReturnValue(
        Promise.resolve(true),
      );
      const token = mockJwtService.generateToken({ id: user.id });
      expect(jwtService.generateToken).toHaveBeenCalledTimes(1);
      expect(jwtService.generateToken).toHaveBeenCalledWith({ id: user.id });
      const result = await service.login(user);
      expect(result).toMatchObject({
        ok: true,
        message: 'User logged in successfully',
        token,
      });
    });

    it('should fail on any execption', async () => {
      users.findOne.mockRejectedValue(new Error('mock error'));
      const result = await service.login(user);
      expect(result).toMatchObject({
        ok: false,
        message: expect.any(String),
      });
    });
  });
});
