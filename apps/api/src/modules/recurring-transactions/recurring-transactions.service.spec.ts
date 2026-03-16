import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CategoryType,
  RecurringInterval,
  TransactionType,
} from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { PrismaService } from '../shared/prisma.service';

type RecurringRecord = {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  type: TransactionType;
  interval: RecurringInterval;
  startDate: Date;
  nextRun: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const stripUndefined = <T extends Record<string, any>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));

const createPrismaMock = () => {
  let store: RecurringRecord[] = [];
  let idIndex = 0;
  const ids = [
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
  ];

  return {
    recurringTransaction: {
      findMany: jest.fn(({ where }) =>
        store.filter((r) => !where?.userId || r.userId === where.userId),
      ),
      findUnique: jest.fn(
        ({ where: { id } }) => store.find((r) => r.id === id) ?? null,
      ),
      create: jest.fn(({ data }) => {
        const clean = stripUndefined(data) as Omit<RecurringRecord, 'id'>;
        const record: RecurringRecord = {
          id: ids[idIndex++] ?? 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
          ...clean,
          endDate: clean.endDate ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as RecurringRecord;
        store.push(record);
        return record;
      }),
      update: jest.fn(({ where: { id }, data }) => {
        const idx = store.findIndex((r) => r.id === id);
        if (idx === -1) return null;
        const clean = stripUndefined(data) as Partial<RecurringRecord>;
        store[idx] = { ...store[idx], ...clean } as RecurringRecord;
        return store[idx];
      }),
      delete: jest.fn(({ where: { id } }) => {
        const idx = store.findIndex((r) => r.id === id);
        const [removed] = store.splice(idx, 1);
        return removed;
      }),
    },
    __reset: () => {
      store = [];
      idIndex = 0;
    },
  };
};

const buildCategory = (
  id: string,
  type: CategoryType = CategoryType.INCOME,
) => ({
  id,
  name: 'Test Category',
  type,
  userId: 'user-123',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
});

describe('RecurringTransactionsService', () => {
  let service: RecurringTransactionsService;
  let categoriesService: CategoriesService;

  const userId = 'user-123';
  const otherUserId = 'user-456';
  const categoryId = '11111111-1111-1111-1111-111111111111';
  const otherCategoryId = '22222222-2222-2222-2222-222222222222';
  const missingId = '33333333-3333-3333-3333-333333333333';
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsService,
        {
          provide: CategoriesService,
          useValue: { getCategoryById: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: I18nService,
          useValue: { t: jest.fn((key: string) => key) },
        },
      ],
    }).compile();

    service = module.get<RecurringTransactionsService>(
      RecurringTransactionsService,
    );
    categoriesService = module.get<CategoriesService>(CategoriesService);
    prismaMock.__reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an empty array initially', async () => {
      const result = await service.getAll(userId);
      expect(result).toEqual([]);
    });

    it('should return only records scoped by userId', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId));

      const dto: CreateRecurringTransactionDto = {
        amount: 100,
        categoryId,
        description: 'Salary',
        interval: RecurringInterval.MONTHLY,
        startDate: '2026-01-01T00:00:00.000Z',
      };

      await service.create(dto, userId);
      await service.create(dto, userId);
      await service.create(dto, otherUserId);

      const userRecords = await service.getAll(userId);
      expect(userRecords.length).toBe(2);

      const otherRecords = await service.getAll(otherUserId);
      expect(otherRecords.length).toBe(1);
    });
  });

  describe('getById', () => {
    it('should throw NotFoundException for non-existent record', async () => {
      await expect(service.getById(missingId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the record when found and owned by user', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId));

      const dto: CreateRecurringTransactionDto = {
        amount: 100,
        categoryId,
        description: 'Salary',
        interval: RecurringInterval.MONTHLY,
        startDate: '2026-01-01T00:00:00.000Z',
      };

      const created = await service.create(dto, userId);
      const found = await service.getById(created.id, userId);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.amount).toBe('100.00');
    });

    it('should throw NotFoundException when user does not own the record', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId));

      const dto: CreateRecurringTransactionDto = {
        amount: 100,
        categoryId,
        description: 'Salary',
        interval: RecurringInterval.MONTHLY,
        startDate: '2026-01-01T00:00:00.000Z',
      };

      const created = await service.create(dto, userId);
      await expect(service.getById(created.id, otherUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a record with nextRun equal to startDate', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId, CategoryType.INCOME));

      const dto: CreateRecurringTransactionDto = {
        amount: 1000,
        categoryId,
        description: 'Monthly salary',
        interval: RecurringInterval.MONTHLY,
        startDate: '2026-01-01T00:00:00.000Z',
      };

      const record = await service.create(dto, userId);

      expect(record).toBeDefined();
      expect(record.amount).toBe('1000.00');
      expect(record.type).toBe(TransactionType.INCOME);
      expect(record.nextRun).toBe(record.startDate);
      expect(record.isActive).toBe(true);
    });

    it('should derive INCOME type from INCOME category', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId, CategoryType.INCOME));

      const record = await service.create(
        {
          amount: 100,
          categoryId,
          description: 'Salary',
          interval: RecurringInterval.MONTHLY,
          startDate: '2026-01-01T00:00:00.000Z',
        },
        userId,
      );

      expect(record.type).toBe(TransactionType.INCOME);
    });

    it('should derive EXPENSE type from EXPENSE category', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId, CategoryType.EXPENSE));

      const record = await service.create(
        {
          amount: 50,
          categoryId,
          description: 'Netflix',
          interval: RecurringInterval.MONTHLY,
          startDate: '2026-01-01T00:00:00.000Z',
        },
        userId,
      );

      expect(record.type).toBe(TransactionType.EXPENSE);
    });

    it('should throw BadRequestException when category does not exist', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(
        service.create(
          {
            amount: 100,
            categoryId: otherCategoryId,
            description: 'test',
            interval: RecurringInterval.MONTHLY,
            startDate: '2026-01-01T00:00:00.000Z',
          },
          userId,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should store endDate when provided', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId));

      const record = await service.create(
        {
          amount: 100,
          categoryId,
          description: 'Rent',
          interval: RecurringInterval.MONTHLY,
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        },
        userId,
      );

      expect(record.endDate).toBe('2026-12-31T00:00:00.000Z');
    });
  });

  describe('update', () => {
    let recordId: string;

    beforeEach(async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId, CategoryType.INCOME));

      const created = await service.create(
        {
          amount: 100,
          categoryId,
          description: 'Salary',
          interval: RecurringInterval.MONTHLY,
          startDate: '2026-01-01T00:00:00.000Z',
        },
        userId,
      );
      recordId = created.id;
    });

    it('should throw NotFoundException for non-existent record', async () => {
      await expect(
        service.update(missingId, { amount: 200 }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user does not own the record', async () => {
      await expect(
        service.update(recordId, { amount: 200 }, otherUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update amount', async () => {
      const updated = await service.update(recordId, { amount: 200 }, userId);
      expect(updated.amount).toBe('200.00');
    });

    it('should deactivate when isActive=false is passed', async () => {
      const updated = await service.update(
        recordId,
        { isActive: false },
        userId,
      );
      expect(updated.isActive).toBe(false);
    });

    it('should re-derive type when categoryId changes', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValueOnce(
          buildCategory(otherCategoryId, CategoryType.EXPENSE),
        );

      const dto: UpdateRecurringTransactionDto = {
        categoryId: otherCategoryId,
      };
      const updated = await service.update(recordId, dto, userId);

      expect(updated.categoryId).toBe(otherCategoryId);
      expect(updated.type).toBe(TransactionType.EXPENSE);
    });

    it('should throw BadRequestException when new categoryId does not exist', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockRejectedValue(new NotFoundException('Category not found'));

      await expect(
        service.update(recordId, { categoryId: otherCategoryId }, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException for non-existent record', async () => {
      await expect(service.delete(missingId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user does not own the record', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId));

      const created = await service.create(
        {
          amount: 100,
          categoryId,
          description: 'Salary',
          interval: RecurringInterval.MONTHLY,
          startDate: '2026-01-01T00:00:00.000Z',
        },
        userId,
      );

      await expect(service.delete(created.id, otherUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete and return the record', async () => {
      jest
        .spyOn(categoriesService, 'getCategoryById')
        .mockResolvedValue(buildCategory(categoryId));

      const created = await service.create(
        {
          amount: 100,
          categoryId,
          description: 'Salary',
          interval: RecurringInterval.MONTHLY,
          startDate: '2026-01-01T00:00:00.000Z',
        },
        userId,
      );

      const deleted = await service.delete(created.id, userId);
      expect(deleted.id).toBe(created.id);

      const remaining = await service.getAll(userId);
      expect(remaining.length).toBe(0);
    });
  });
});
