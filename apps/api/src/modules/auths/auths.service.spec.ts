import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { AuthsService } from './auths.service';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from '../shared/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthsService', () => {
  let service: AuthsService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn((key: string, defaultValue?: number) => {
      if (key === 'jwt.expiresInSeconds') return 900;
      if (key === 'jwt.refreshExpiresInSeconds') return 604800;
      return defaultValue;
    }),
  };

  const i18nServiceMock = {
    t: jest.fn((key: string) => key),
  };

  const emailVerificationServiceMock = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: I18nService,
          useValue: i18nServiceMock,
        },
        {
          provide: EmailVerificationService,
          useValue: emailVerificationServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthsService>(AuthsService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password1',
    };

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      refreshToken: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should hash password before saving user', async () => {
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      emailVerificationServiceMock.sendVerificationEmail.mockResolvedValue(
        undefined,
      );

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword,
        },
      });
    });

    it('should create user and send verification email, returning a message', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      emailVerificationServiceMock.sendVerificationEmail.mockResolvedValue(
        undefined,
      );

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'auth.success.verificationEmailSent',
      });
      expect(
        emailVerificationServiceMock.sendVerificationEmail,
      ).toHaveBeenCalledWith(mockUser.id, mockUser.email, expect.any(String));
    });

    it('should throw ConflictException when email already exists', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'auth.errors.emailAlreadyExists',
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'Password1' };
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      refreshToken: null,
      emailVerified: true,
      isActive: true,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return access_token and refresh_token on valid credentials', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access.token')
        .mockResolvedValueOnce('refresh.token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'access.token',
        refresh_token: 'refresh.token',
      });
    });

    it('should throw ForbiddenException when account is inactive', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.errors.accountInactive',
      );
    });

    it('should throw ForbiddenException when email is not verified', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.errors.emailNotVerified',
      );
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.errors.invalidCredentials',
      );
    });

    it('should call bcrypt.compare even when user is not found (timing-safe)', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.errors.invalidCredentials',
      );

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      const [, hashArg] = (bcrypt.compare as jest.Mock).mock.calls[0];
      expect(hashArg).toMatch(/^\$2b\$/);
    });
  });

  describe('refresh', () => {
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@example.com',
      refreshToken: 'storedHashedRefreshToken',
    };

    it('should return new tokens when refresh token is valid', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
      });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedRefreshToken');
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('new.access.token')
        .mockResolvedValueOnce('new.refresh.token');

      const result = await service.refresh('old.refresh.token');

      expect(result).toEqual({
        access_token: 'new.access.token',
        refresh_token: 'new.refresh.token',
      });
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refresh('expired.token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('expired.token')).rejects.toThrow(
        'auth.errors.invalidRefreshToken',
      );
    });

    it('should throw UnauthorizedException when user has no stored refresh token', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
      });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      });

      await expect(service.refresh('some.refresh.token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('some.refresh.token')).rejects.toThrow(
        'auth.errors.invalidRefreshToken',
      );
    });

    it('should throw UnauthorizedException when token hash does not match', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
      });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('tampered.token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('tampered.token')).rejects.toThrow(
        'auth.errors.invalidRefreshToken',
      );
    });
  });

  describe('logout', () => {
    it('should clear the stored refresh token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      (prismaService.user.update as jest.Mock).mockResolvedValue({});

      await service.logout(userId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: null },
      });
    });
  });

  describe('generateToken', () => {
    it('should generate access and refresh tokens with correct payloads', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const email = 'test@example.com';
      const mockAccessToken = 'access.mock.token';
      const mockRefreshToken = 'refresh.mock.token';

      jwtServiceMock.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      (prismaService.user.update as jest.Mock).mockResolvedValue({});

      const result = await service.generateToken(userId, email);

      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { userId, email, isAdmin: false },
        { expiresIn: 900 },
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { userId, email, isAdmin: false },
        { expiresIn: 604800 },
      );
    });

    it('should store a bcrypt hash of the refresh token in the DB', async () => {
      const userId = '456e4567-e89b-12d3-a456-426614174001';
      const email = 'another@example.com';
      const mockRefreshToken = 'refresh.token.value';

      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access.token')
        .mockResolvedValueOnce(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedValue');
      (prismaService.user.update as jest.Mock).mockResolvedValue({});

      await service.generateToken(userId, email);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRefreshToken, 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: 'hashedValue' },
      });
    });

    it('should use payload with userId, email, and isAdmin', async () => {
      const userId = '456e4567-e89b-12d3-a456-426614174001';
      const email = 'another@example.com';

      jwtServiceMock.signAsync.mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');
      (prismaService.user.update as jest.Mock).mockResolvedValue({});

      await service.generateToken(userId, email, true);

      const firstCallPayload = jwtServiceMock.signAsync.mock.calls[0][0];
      expect(Object.keys(firstCallPayload)).toHaveLength(3);
      expect(firstCallPayload).toEqual({ userId, email, isAdmin: true });
    });
  });
});
