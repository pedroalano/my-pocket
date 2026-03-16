import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringInterval } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

const BATCH_SIZE = 100;

function computeNextRun(current: Date, interval: RecurringInterval): Date {
  const next = new Date(current);
  switch (interval) {
    case RecurringInterval.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case RecurringInterval.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case RecurringInterval.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case RecurringInterval.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

@Injectable()
export class RecurringTransactionsScheduler {
  private readonly logger = new Logger(RecurringTransactionsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processRecurringTransactions(): Promise<void> {
    const now = new Date();
    let cursor: string | undefined;

    while (true) {
      const batch = await this.prisma.recurringTransaction.findMany({
        where: {
          isActive: true,
          nextRun: { lte: now },
        },
        orderBy: { id: 'asc' },
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        select: {
          id: true,
          userId: true,
          categoryId: true,
          description: true,
          amount: true,
          type: true,
          interval: true,
          nextRun: true,
          endDate: true,
        },
      });

      if (batch.length === 0) break;

      await Promise.allSettled(batch.map((record) => this.processOne(record)));

      if (batch.length < BATCH_SIZE) break;
      cursor = batch[batch.length - 1].id;
    }
  }

  private async processOne(record: {
    id: string;
    userId: string;
    categoryId: string;
    description: string;
    amount: { toString(): string };
    interval: RecurringInterval;
    nextRun: Date;
    endDate: Date | null;
  }): Promise<void> {
    try {
      await this.transactionsService.createTransaction(
        {
          amount: Number(record.amount.toString()),
          categoryId: record.categoryId,
          date: record.nextRun.toISOString(),
          description: record.description,
        },
        record.userId,
      );
    } catch (error: unknown) {
      this.logger.error('Failed to create transaction for recurring record', {
        recordId: record.id,
        userId: record.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    const newNextRun = computeNextRun(record.nextRun, record.interval);

    if (record.endDate && newNextRun > record.endDate) {
      await this.prisma.recurringTransaction.update({
        where: { id: record.id },
        data: { isActive: false },
      });
    } else {
      await this.prisma.recurringTransaction.update({
        where: { id: record.id },
        data: { nextRun: newNextRun },
      });
    }
  }
}
