import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { DatabaseService } from 'src/database/database.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as utils from 'src/utils/utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('UserService', () => {
  let service: UserService;
  let mailService: MailService;
  let databaseMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    databaseMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register user to database and send verification email', async () => {
      const testCreateUserDto: CreateUserDto = {
        username: 'testName',
        email: 'test@example.com',
      };

      const generatedVerificationToken = 'TEST';

      const createdTestUser = {
        ...testCreateUserDto,
        verificationToken: generatedVerificationToken,
        isVerified: false,
      };

      jest
        .spyOn(utils, 'generateAlphanumeric')
        .mockReturnValue(generatedVerificationToken);
      databaseMock.user.create.mockResolvedValue({ ...createdTestUser, id: 1 });

      const result = await service.register(testCreateUserDto);
      expect(result).toEqual('User successfully registered');
      expect(databaseMock.user.create).toHaveBeenCalledTimes(1);
      expect(databaseMock.user.create).toHaveBeenCalledWith({
        data: createdTestUser,
      });

      expect(mailService.sendVerification).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerification).toHaveBeenCalledWith(
        testCreateUserDto.username,
        testCreateUserDto.email,
        generatedVerificationToken,
      );
    });

    it('should throw PrismaClientKnownRequestError with code P2002 if email already exists in database', async () => {
      const testCreateUserDto: CreateUserDto = {
        username: 'testName',
        email: 'test@example.com',
      };

      databaseMock.user.create.mockImplementation(() => {
        throw new PrismaClientKnownRequestError(
          'Unique constraint failed on the fields: (`email`)',
          {
            code: 'P2002',
            clientVersion: '1.0',
          },
        );
      });

      await expect(service.register(testCreateUserDto)).rejects.toThrow(
        'Unique constraint failed on the fields: (`email`)',
      );
    });

    it('should throw BadRequestException if email is empty or in wrong format', async () => {
      const testCreateUserDto: CreateUserDto = {
        username: 'testName',
        email: 'wrongEmailFormat',
      };

      databaseMock.user.create.mockImplementation(() => {
        throw new BadRequestException('email must be an email');
      });

      await expect(service.register(testCreateUserDto)).rejects.toThrow(
        'email must be an email',
      );
    });
  });

  describe('verifyEmail', () => {
    it('updates isVerified in database', async () => {
      const user = {
        id: 1,
        username: 'testName',
        email: 'test@example.com',
        verificationToken: 'TEST',
        isVerified: false,
      };

      databaseMock.user.findUniqueOrThrow.mockResolvedValue(user);

      const result = await service.verifyEmail('testName', 'TEST');
      expect(result).toEqual('User successfully verified');
      expect(databaseMock.user.update).toHaveBeenCalledTimes(1);
      expect(databaseMock.user.update).toHaveBeenCalledWith({
        where: { username: 'testName' },
        data: { isVerified: true },
      });
    });

    it('should throw PrismaClientKnownRequestError with code P2025 if user does not exist', async () => {
      databaseMock.user.findUniqueOrThrow.mockImplementation(() => {
        throw new PrismaClientKnownRequestError('No User found', {
          code: 'P2025',
          clientVersion: '1.0',
        });
      });

      await expect(service.verifyEmail('testName', 'TEST')).rejects.toThrow(
        'No User found',
      );
    });

    it('should throw BadRequestException if user is already verified', async () => {
      const user = {
        id: 1,
        username: 'testName',
        email: 'test@example.com',
        verificationToken: 'TEST',
        isVerified: true,
      };

      databaseMock.user.findUniqueOrThrow.mockResolvedValue(user);

      await expect(service.verifyEmail('testName', 'TEST')).rejects.toThrow(
        'User already verified',
      );
    });

    it('should throw BadRequestException if verification token is invalid', async () => {
      const user = {
        id: 1,
        username: 'testName',
        email: 'test@example.com',
        verificationToken: 'TEST',
        isVerified: false,
      };

      databaseMock.user.findUniqueOrThrow.mockResolvedValue(user);

      await expect(
        service.verifyEmail('testName', 'INVALIDTOKEN'),
      ).rejects.toThrow('Invalid verification token');
    });
  });

  describe('checkVerification', () => {
    it('should return "User is verified" if verified', async () => {
      const user = {
        id: 1,
        username: 'testName',
        email: 'test@example.com',
        verificationToken: 'TEST',
        isVerified: true,
      };

      databaseMock.user.findUniqueOrThrow.mockResolvedValue(user);

      const result = await service.checkVerification('testName');
      expect(result).toEqual('User is verified');
    });

    it('should return "User is not verified" if not verified', async () => {
      const user = {
        id: 1,
        username: 'testName',
        email: 'test@example.com',
        verificationToken: 'TEST',
        isVerified: false,
      };

      databaseMock.user.findUniqueOrThrow.mockResolvedValue(user);

      const result = await service.checkVerification('testName');
      expect(result).toEqual('User is not verified');
    });

    it('should throw PrismaClientKnownRequestError with code P2025 if user does not exist', async () => {
      databaseMock.user.findUniqueOrThrow.mockImplementation(() => {
        throw new PrismaClientKnownRequestError('No User found', {
          code: 'P2025',
          clientVersion: '1.0',
        });
      });

      await expect(service.checkVerification('testName')).rejects.toThrow(
        'No User found',
      );
    });
  });
});
