import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { Resend } from 'resend';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class EmailVerificationService {
  private _resend: Resend | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  private get resend(): Resend {
    if (!this._resend) {
      const apiKey = this.configService.get<string>('resend.apiKey', '');
      this._resend = new Resend(apiKey);
    }
    return this._resend;
  }

  private get lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    _lang: string,
  ): Promise<void> {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    const frontendUrl = this.configService.get<string>(
      'frontend.url',
      'http://localhost:3000',
    );
    const fromEmail = this.configService.get<string>(
      'resend.fromEmail',
      'noreply@yourdomain.com',
    );

    await this.resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify your email address',
      html: `
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${frontendUrl}/verify-email?token=${plainToken}">Verify Email</a></p>
        <p>This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
      `,
    });
  }

  async verifyEmail(
    token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const tokenHash = this.hashToken(token);

    const verificationToken =
      await this.prisma.emailVerificationToken.findFirst({
        where: { tokenHash },
      });

    const isValid =
      verificationToken && verificationToken.expiresAt > new Date();

    if (!isValid) {
      throw new BadRequestException(
        this.i18n.t('auth.errors.invalidOrExpiredVerificationToken', {
          lang: this.lang,
        }),
      );
    }

    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return this.generateToken(user.id, user.email);
  }

  async resendVerification(
    email: string,
    lang: string,
  ): Promise<{ message: string }> {
    const successMessage = this.i18n.t('auth.success.verificationEmailSent', {
      lang,
    });

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return { message: successMessage };
    }

    await this.sendVerificationEmail(user.id, user.email, lang);

    return { message: successMessage };
  }

  async generateToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { userId, email };

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
