import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { PrismaService } from '../shared/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class AuthsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { name, email, password } = registerDto;

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create user in database
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Send verification email instead of returning tokens
      await this.emailVerificationService.sendVerificationEmail(
        user.id,
        user.email,
        this.lang,
      );

      return {
        message: this.i18n.t('auth.success.verificationEmailSent', {
          lang: this.lang,
        }),
      };
    } catch (error) {
      // Handle Prisma unique constraint violation (P2002)
      const isPrismaError =
        error instanceof Prisma.PrismaClientKnownRequestError ||
        (typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          typeof (error as { code: unknown }).code === 'string');
      if (isPrismaError && (error as { code: string }).code === 'P2002') {
        throw new ConflictException(
          this.i18n.t('auth.errors.emailAlreadyExists', { lang: this.lang }),
        );
      }
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always run bcrypt.compare to prevent timing-based email enumeration
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password ?? '$2b$10$invalidhashfortimingneutralization00000000000',
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidCredentials', { lang: this.lang }),
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        this.i18n.t('auth.errors.accountInactive', { lang: this.lang }),
      );
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        this.i18n.t('auth.errors.emailNotVerified', { lang: this.lang }),
      );
    }

    return this.generateToken(user.id, user.email, user.isAdmin);
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    let payload: { userId: string; email: string };

    try {
      payload = await this.jwtService.verifyAsync<{
        userId: string;
        email: string;
      }>(refreshToken);
    } catch {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidRefreshToken', { lang: this.lang }),
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidRefreshToken', { lang: this.lang }),
      );
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidRefreshToken', { lang: this.lang }),
      );
    }

    return this.generateToken(user.id, user.email, user.isAdmin);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async generateToken(
    userId: string,
    email: string,
    isAdmin: boolean = false,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { userId, email, isAdmin };

    const accessExpiresIn = this.configService.get<number>(
      'jwt.expiresInSeconds',
      900,
    );
    const refreshExpiresIn = this.configService.get<number>(
      'jwt.refreshExpiresInSeconds',
      604800,
    );

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn,
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiresIn,
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return { access_token, refresh_token };
  }
}
