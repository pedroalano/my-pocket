import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { PrismaService } from '../shared/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  }> {
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
    ]);

    return { totalUsers, activeUsers, inactiveUsers };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserStatus(adminId: string, targetId: string, isActive: boolean) {
    if (adminId === targetId) {
      throw new ForbiddenException(
        this.i18n.t('admin.errors.cannotDeactivateSelf', { lang: this.lang }),
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('admin.errors.userNotFound', { lang: this.lang }),
      );
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
      },
    });
  }
}
