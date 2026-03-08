import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { PrismaService } from '../shared/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
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

      // Generate and return JWT token
      return this.generateToken(user.id, user.email);
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

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidCredentials', { lang: this.lang }),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.errors.invalidCredentials', { lang: this.lang }),
      );
    }

    return this.generateToken(user.id, user.email);
  }

  async generateToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { userId, email };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }
}
