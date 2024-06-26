import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let databaseMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    databaseMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: DatabaseService, useValue: databaseMock },
        {
          provide: MailService,
          useValue: {
            sendVerification: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register user to database and send verification email', async () => {
      const testCreateUserDto: CreateUserDto = {
        username: 'testName',
        email: 'test@example.com',
      };

      jest
        .spyOn(userService, 'register')
        .mockResolvedValue('User successfully registered');

      const result = await controller.register(testCreateUserDto);
      expect(userService.register).toHaveBeenCalledTimes(1);
      expect(userService.register).toHaveBeenCalledWith(testCreateUserDto);

      expect(result).toEqual('User successfully registered');
    });

    it('should throw PrismaClientKnownRequestError with code P2002 if email already exists in database', async () => {
      const testCreateUserDto: CreateUserDto = {
        username: 'testName',
        email: 'test@example.com',
      };

      jest.spyOn(userService, 'register').mockRejectedValue(() => {
        throw new PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`email`)',
          {
            code: 'P2002',
            clientVersion: '1.0',
          },
        );
      });

      await expect(controller.register(testCreateUserDto)).rejects.toThrow(
        'Unique constraint failed on the fields: (`email`)',
      );
    });

    it('should throw BadRequestException if email is empty or in wrong format', async () => {
      const testCreateUserDto: CreateUserDto = {
        username: 'testName',
        email: 'wrongEmailFormat',
      };

      jest.spyOn(userService, 'register').mockRejectedValue(() => {
        throw new BadRequestException('email must be an email');
      });

      await expect(controller.register(testCreateUserDto)).rejects.toThrow(
        'email must be an email',
      );
    });
  });

  describe('verifyEmail', () => {
    it('updates isVerified in database', async () => {
      jest
        .spyOn(userService, 'verifyEmail')
        .mockResolvedValue('User successfully verified');

      const result = await controller.verifyEmail('testName', 'TEST');
      expect(result).toEqual('User successfully verified');
      expect(userService.verifyEmail).toHaveBeenCalledTimes(1);
      expect(userService.verifyEmail).toHaveBeenCalledWith('testName', 'TEST');
    });

    it('should throw PrismaClientKnownRequestError with code P2025 if user does not exist', async () => {
      jest.spyOn(userService, 'verifyEmail').mockRejectedValue(() => {
        throw new PrismaClientKnownRequestError('No User found', {
          code: 'P2025',
          clientVersion: '1.0',
        });
      });

      await expect(controller.verifyEmail('testName', 'TEST')).rejects.toThrow(
        'No User found',
      );
    });

    it('should throw BadRequestException if user is already verified', async () => {
      jest.spyOn(userService, 'verifyEmail').mockRejectedValue(() => {
        throw new BadRequestException('User already verified');
      });

      await expect(controller.verifyEmail('testName', 'TEST')).rejects.toThrow(
        'User already verified',
      );
    });

    it('should throw BadRequestException if verification token is invalid', async () => {
      jest.spyOn(userService, 'verifyEmail').mockRejectedValue(() => {
        throw new BadRequestException('Invalid verification token');
      });

      await expect(controller.verifyEmail('testName', 'TEST')).rejects.toThrow(
        'Invalid verification token',
      );
    });
  });

  describe('checkVerification', () => {
    it('should return "User is verified" if verified', async () => {
      jest
        .spyOn(userService, 'checkVerification')
        .mockResolvedValue('User is verified');

      const result = await controller.checkVerification('testName');
      expect(result).toEqual('User is verified');
      expect(userService.checkVerification).toHaveBeenCalledTimes(1);
      expect(userService.checkVerification).toHaveBeenCalledWith('testName');
    });

    it('should return "User is not verified" if not verified', async () => {
      jest
        .spyOn(userService, 'checkVerification')
        .mockResolvedValue('User is not verified');

      const result = await controller.checkVerification('testName');
      expect(result).toEqual('User is not verified');
    });

    it('should throw PrismaClientKnownRequestError with code P2025 if user does not exist', async () => {
      jest.spyOn(userService, 'checkVerification').mockRejectedValue(() => {
        throw new PrismaClientKnownRequestError('No User found', {
          code: 'P2025',
          clientVersion: '1.0',
        });
      });

      await expect(controller.checkVerification('testName')).rejects.toThrow(
        'No User found',
      );
    });
  });
});
