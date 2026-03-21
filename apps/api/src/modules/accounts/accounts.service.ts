import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from '../shared/prisma.service';
import { formatDecimal } from '../shared';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  private mapAccount(account: {
    id: string;
    name: string;
    type: string;
    initialBalance: { toString(): string };
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    transactions: { amount: { toString(): string }; type: TransactionType }[];
  }) {
    const initialBalance = formatDecimal(account.initialBalance);
    const currentBalance =
      parseFloat(initialBalance) +
      account.transactions.reduce((sum, t) => {
        const amount = parseFloat(formatDecimal(t.amount));
        return t.type === TransactionType.INCOME ? sum + amount : sum - amount;
      }, 0);

    return {
      ...account,
      initialBalance,
      currentBalance,
      transactions: undefined,
    };
  }

  async getAllAccounts(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
    });
    return accounts.map((account) => this.mapAccount(account));
  }

  async getAccountById(id: string, userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
    });
    if (!account || account.userId !== userId) {
      throw new NotFoundException(
        this.i18n.t('accounts.errors.notFound', {
          args: { id },
          lang: this.lang,
        }),
      );
    }
    return this.mapAccount(account);
  }

  async createAccount(dto: CreateAccountDto, userId: string) {
    const account = await this.prisma.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        initialBalance: dto.initialBalance,
        userId,
      },
    });
    return this.mapAccount({ ...account, transactions: [] });
  }

  async updateAccount(id: string, dto: UpdateAccountDto, userId: string) {
    await this.getAccountById(id, userId);
    const account = await this.prisma.account.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        initialBalance: dto.initialBalance,
      },
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
    });
    return this.mapAccount(account);
  }

  async deleteAccount(id: string, userId: string) {
    await this.getAccountById(id, userId);
    const transactionCount = await this.prisma.transaction.count({
      where: { accountId: id },
    });
    if (transactionCount > 0) {
      throw new ConflictException(
        this.i18n.t('accounts.errors.hasTransactions', { lang: this.lang }),
      );
    }
    return this.prisma.account.delete({ where: { id } });
  }
}
