import { Test, TestingModule } from '@nestjs/testing';
import { RecurringInterval, TransactionType } from '@prisma/client';
import { RecurringTransactionsScheduler } from './recurring-transactions.scheduler';
import { TransactionsService } from '../transactions/transactions.service';
import { PrismaService } from '../shared/prisma.service';

type RecurringRecord = {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: { toString(): string };
  type: TransactionType;
  interval: RecurringInterval;
  nextRun: Date;
  endDate: Date | null;
};

const makeRecord = (
  overrides: Partial<RecurringRecord> = {},
): RecurringRecord => ({
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  userId: 'user-123',
  categoryId: 'cat-111',
  description: 'Netflix',
  amount: { toString: () => '15.00' },
  type: TransactionType.EXPENSE,
  interval: RecurringInterval.MONTHLY,
  nextRun: new Date('2026-01-01T00:00:00.000Z'),
  endDate: null,
  ...overrides,
});

describe('RecurringTransactionsScheduler', () => {
  let scheduler: RecurringTransactionsScheduler;
  let transactionsService: TransactionsService;
  let prismaMock: {
    recurringTransaction: {
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      recurringTransaction: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsScheduler,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: TransactionsService,
          useValue: {
            createTransaction: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    scheduler = module.get<RecurringTransactionsScheduler>(
      RecurringTransactionsScheduler,
    );
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should call createTransaction for each due record', async () => {
    const record = makeRecord();
    prismaMock.recurringTransaction.findMany
      .mockResolvedValueOnce([record])
      .mockResolvedValueOnce([]);

    await scheduler.processRecurringTransactions();

    expect(transactionsService.createTransaction).toHaveBeenCalledTimes(1);
    expect(transactionsService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: record.categoryId,
        description: record.description,
        date: record.nextRun.toISOString(),
        amount: 15,
      }),
      record.userId,
    );
  });

  describe('nextRun computation per interval', () => {
    it.each([
      [RecurringInterval.DAILY, '2026-01-02T00:00:00.000Z'],
      [RecurringInterval.WEEKLY, '2026-01-08T00:00:00.000Z'],
      [RecurringInterval.MONTHLY, '2026-02-01T00:00:00.000Z'],
      [RecurringInterval.YEARLY, '2027-01-01T00:00:00.000Z'],
    ])('%s → nextRun=%s', async (interval, expectedNextRun) => {
      const record = makeRecord({ interval });
      prismaMock.recurringTransaction.findMany
        .mockResolvedValueOnce([record])
        .mockResolvedValueOnce([]);

      await scheduler.processRecurringTransactions();

      expect(prismaMock.recurringTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nextRun: new Date(expectedNextRun),
          }),
        }),
      );
    });
  });

  it('should set isActive=false when newNextRun > endDate', async () => {
    const record = makeRecord({
      interval: RecurringInterval.MONTHLY,
      nextRun: new Date('2026-11-01T00:00:00.000Z'),
      endDate: new Date('2026-11-30T00:00:00.000Z'),
    });
    prismaMock.recurringTransaction.findMany
      .mockResolvedValueOnce([record])
      .mockResolvedValueOnce([]);

    await scheduler.processRecurringTransactions();

    expect(prismaMock.recurringTransaction.update).toHaveBeenCalledWith({
      where: { id: record.id },
      data: { isActive: false },
    });
  });

  it('should NOT update nextRun when createTransaction throws', async () => {
    const record = makeRecord();
    prismaMock.recurringTransaction.findMany
      .mockResolvedValueOnce([record])
      .mockResolvedValueOnce([]);

    jest
      .spyOn(transactionsService, 'createTransaction')
      .mockRejectedValue(new Error('DB error'));

    await scheduler.processRecurringTransactions();

    expect(prismaMock.recurringTransaction.update).not.toHaveBeenCalled();
  });

  it('should continue processing other records when one fails', async () => {
    const failing = makeRecord({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
    const succeeding = makeRecord({
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    });

    prismaMock.recurringTransaction.findMany
      .mockResolvedValueOnce([failing, succeeding])
      .mockResolvedValueOnce([]);

    jest
      .spyOn(transactionsService, 'createTransaction')
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValueOnce({} as any);

    await scheduler.processRecurringTransactions();

    expect(prismaMock.recurringTransaction.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.recurringTransaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: succeeding.id } }),
    );
  });

  it('should issue a second batch query when first batch returns 100 records', async () => {
    const batch1 = Array.from({ length: 100 }, (_, i) =>
      makeRecord({ id: `id-${i.toString().padStart(3, '0')}` }),
    );
    prismaMock.recurringTransaction.findMany
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce([]);

    await scheduler.processRecurringTransactions();

    expect(prismaMock.recurringTransaction.findMany).toHaveBeenCalledTimes(2);
    // Second call should use cursor from last item in first batch
    expect(prismaMock.recurringTransaction.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        skip: 1,
        cursor: { id: batch1[99].id },
      }),
    );
  });
});
