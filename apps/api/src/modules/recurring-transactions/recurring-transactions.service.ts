import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RecurringInterval, TransactionType } from '@prisma/client';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../shared/prisma.service';
import { formatDecimal } from '../shared';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private categoriesService: CategoriesService,
    private prisma: PrismaService,
    private i18n: I18nService,
  ) {}

  private get lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  private mapRecord(record: {
    id: string;
    userId: string;
    categoryId: string;
    description: string;
    amount: { toString(): string };
    type: TransactionType;
    interval: RecurringInterval;
    startDate: Date;
    nextRun: Date;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      ...record,
      amount: formatDecimal(record.amount),
      startDate: record.startDate.toISOString(),
      nextRun: record.nextRun.toISOString(),
      endDate: record.endDate ? record.endDate.toISOString() : undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private readonly recordSelect = {
    id: true,
    userId: true,
    categoryId: true,
    description: true,
    amount: true,
    type: true,
    interval: true,
    startDate: true,
    nextRun: true,
    endDate: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  async getAll(userId: string) {
    const records = await this.prisma.recurringTransaction.findMany({
      where: { userId },
      select: this.recordSelect,
    });
    return records.map((r) => this.mapRecord(r));
  }

  async getById(id: string, userId: string) {
    const record = await this.prisma.recurringTransaction.findUnique({
      where: { id },
      select: this.recordSelect,
    });
    if (!record || record.userId !== userId) {
      throw new NotFoundException(
        this.i18n.t('recurringTransactions.errors.notFound', {
          args: { id },
          lang: this.lang,
        }),
      );
    }
    return this.mapRecord(record);
  }

  async create(dto: CreateRecurringTransactionDto, userId: string) {
    let category = null;
    try {
      category = await this.categoriesService.getCategoryById(
        dto.categoryId,
        userId,
      );
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (!category) {
      throw new BadRequestException(
        this.i18n.t('recurringTransactions.errors.categoryNotFound', {
          args: { id: dto.categoryId },
          lang: this.lang,
        }),
      );
    }

    const startDate = new Date(dto.startDate);
    const record = await this.prisma.recurringTransaction.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        description: dto.description,
        amount: dto.amount,
        type: category.type as unknown as TransactionType,
        interval: dto.interval,
        startDate,
        nextRun: startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: true,
      },
      select: this.recordSelect,
    });
    return this.mapRecord(record);
  }

  async update(id: string, dto: UpdateRecurringTransactionDto, userId: string) {
    const existing = await this.prisma.recurringTransaction.findUnique({
      where: { id },
      select: this.recordSelect,
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(
        this.i18n.t('recurringTransactions.errors.notFound', {
          args: { id },
          lang: this.lang,
        }),
      );
    }

    let newType: TransactionType | undefined;
    if (dto.categoryId !== undefined) {
      let category = null;
      try {
        category = await this.categoriesService.getCategoryById(
          dto.categoryId,
          userId,
        );
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      if (!category) {
        throw new BadRequestException(
          this.i18n.t('recurringTransactions.errors.categoryNotFound', {
            args: { id: dto.categoryId },
            lang: this.lang,
          }),
        );
      }
      newType = category.type as unknown as TransactionType;
    }

    const updated = await this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        description: dto.description,
        amount: dto.amount,
        type: newType,
        interval: dto.interval,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? new Date(dto.endDate) : undefined,
        isActive: dto.isActive,
      },
      select: this.recordSelect,
    });
    return this.mapRecord(updated);
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.recurringTransaction.findUnique({
      where: { id },
      select: this.recordSelect,
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(
        this.i18n.t('recurringTransactions.errors.notFound', {
          args: { id },
          lang: this.lang,
        }),
      );
    }

    const deleted = await this.prisma.recurringTransaction.delete({
      where: { id },
      select: this.recordSelect,
    });
    return this.mapRecord(deleted);
  }
}
