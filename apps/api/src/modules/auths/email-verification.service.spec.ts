import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from '../shared/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

jest.mock('bcryptjs');
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({ id: 'email-id' }) },
  })),
}));

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let prismaService: PrismaService;

  const prismaMock = {
    emailVerificationToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'resend.apiKey') return 're_test_key';
      if (key === 'resend.fromEmail') return 'noreply@test.com';
      if (key === 'frontend.url') return 'http://localhost:3000';
      if (key === 'jwt.expiresInSeconds') return 900;
      if (key === 'jwt.refreshExpiresInSeconds') return 604800;
      return defaultValue;
    }),
  };

  const i18nServiceMock = {
    t: jest.fn((key: string) => key),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john@example.com',
    emailVerified: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: I18nService, useValue: i18nServiceMock },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should delete existing tokens, create a new one, and send email', async () => {
      (
        prismaService.emailVerificationToken.deleteMany as jest.Mock
      ).mockResolvedValue({ count: 1 });
      (
        prismaService.emailVerificationToken.create as jest.Mock
      ).mockResolvedValue({});

      await service.sendVerificationEmail(mockUser.id, mockUser.email, 'en');

      expect(
        prismaService.emailVerificationToken.deleteMany,
      ).toHaveBeenCalledWith({ where: { userId: mockUser.id } });
      expect(prismaService.emailVerificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            tokenHash: expect.any(String),
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should set token expiry to 24 hours from now', async () => {
      (
        prismaService.emailVerificationToken.deleteMany as jest.Mock
      ).mockResolvedValue({});
      (
        prismaService.emailVerificationToken.create as jest.Mock
      ).mockResolvedValue({});

      const before = Date.now();
      await service.sendVerificationEmail(mockUser.id, mockUser.email, 'en');
      const after = Date.now();

      const createCall = (
        prismaService.emailVerificationToken.create as jest.Mock
      ).mock.calls[0][0];
      const expiresAt: Date = createCall.data.expiresAt;
      const expectedMin = before + 24 * 60 * 60 * 1000 - 1000;
      const expectedMax = after + 24 * 60 * 60 * 1000 + 1000;

      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('verifyEmail', () => {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    const mockToken = {
      id: 'token-id',
      userId: mockUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    const verifiedUser = {
      id: mockUser.id,
      email: mockUser.email,
      emailVerified: true,
    };

    it('should verify a valid token and return JWT tokens', async () => {
      (
        prismaService.emailVerificationToken.findFirst as jest.Mock
      ).mockResolvedValue(mockToken);
      (prismaService.$transaction as jest.Mock).mockResolvedValue([
        verifiedUser,
        undefined,
      ]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access.token')
        .mockResolvedValueOnce('refresh.token');
      (prismaService.user.update as jest.Mock).mockResolvedValue(verifiedUser);

      const result = await service.verifyEmail(plainToken);

      expect(result).toEqual({
        access_token: 'access.token',
        refresh_token: 'refresh.token',
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for a non-existent token', async () => {
      (
        prismaService.emailVerificationToken.findFirst as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        'auth.errors.invalidOrExpiredVerificationToken',
      );
    });

    it('should throw BadRequestException for an expired token', async () => {
      (
        prismaService.emailVerificationToken.findFirst as jest.Mock
      ).mockResolvedValue({
        ...mockToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.verifyEmail(plainToken)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendVerification', () => {
    it('should return generic success when user does not exist', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.resendVerification(
        'nobody@example.com',
        'en',
      );

      expect(result).toEqual({
        message: 'auth.success.verificationEmailSent',
      });
    });

    it('should return generic success when user is already verified', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: true,
      });

      const result = await service.resendVerification(mockUser.email, 'en');

      expect(result).toEqual({
        message: 'auth.success.verificationEmailSent',
      });
    });

    it('should send verification email for unverified user', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (
        prismaService.emailVerificationToken.deleteMany as jest.Mock
      ).mockResolvedValue({});
      (
        prismaService.emailVerificationToken.create as jest.Mock
      ).mockResolvedValue({});

      const result = await service.resendVerification(mockUser.email, 'en');

      expect(result).toEqual({
        message: 'auth.success.verificationEmailSent',
      });
      expect(prismaService.emailVerificationToken.create).toHaveBeenCalled();
    });
  });
});
