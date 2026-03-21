import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../shared/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

const userId = 'user-123';
const otherUserId = 'user-456';
const accountId = 'aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const makeAccount = (overrides = {}) => ({
  id: accountId,
  name: 'Main Checking',
  type: 'CHECKING',
  initialBalance: { toString: () => '1000.00' },
  userId,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  transactions: [],
  ...overrides,
});

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaMock: {
    account: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    transaction: {
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      account: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      transaction: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
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

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllAccounts', () => {
    it('should return accounts with currentBalance computed', async () => {
      prismaMock.account.findMany.mockResolvedValue([
        makeAccount({
          initialBalance: { toString: () => '1000.00' },
          transactions: [
            {
              amount: { toString: () => '200.00' },
              type: TransactionType.INCOME,
            },
            {
              amount: { toString: () => '50.00' },
              type: TransactionType.EXPENSE,
            },
          ],
        }),
      ]);

      const result = await service.getAllAccounts(userId);

      expect(result).toHaveLength(1);
      expect(result[0].currentBalance).toBeCloseTo(1150);
    });

    it('should compute balance: INCOME adds, EXPENSE subtracts', async () => {
      prismaMock.account.findMany.mockResolvedValue([
        makeAccount({
          initialBalance: { toString: () => '500.00' },
          transactions: [
            {
              amount: { toString: () => '100.00' },
              type: TransactionType.INCOME,
            },
            {
              amount: { toString: () => '300.00' },
              type: TransactionType.EXPENSE,
            },
          ],
        }),
      ]);

      const [account] = await service.getAllAccounts(userId);
      expect(account.currentBalance).toBeCloseTo(300);
    });
  });

  describe('getAccountById', () => {
    it('should throw NotFoundException when account not found', async () => {
      prismaMock.account.findUnique.mockResolvedValue(null);

      await expect(
        service.getAccountById('missing-id', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when account belongs to another user', async () => {
      prismaMock.account.findUnique.mockResolvedValue(
        makeAccount({ userId: otherUserId }),
      );

      await expect(service.getAccountById(accountId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return account when found and owned by user', async () => {
      prismaMock.account.findUnique.mockResolvedValue(makeAccount());

      const result = await service.getAccountById(accountId, userId);
      expect(result.id).toBe(accountId);
    });
  });

  describe('createAccount', () => {
    it('should create an account and return it with currentBalance equal to initialBalance', async () => {
      const dto: CreateAccountDto = {
        name: 'Savings',
        type: 'SAVINGS' as any,
        initialBalance: 500,
      };

      prismaMock.account.create.mockResolvedValue({
        ...makeAccount({ name: 'Savings', type: 'SAVINGS' }),
        initialBalance: { toString: () => '500.00' },
      });

      const result = await service.createAccount(dto, userId);
      expect(result.name).toBe('Savings');
      expect(result.currentBalance).toBeCloseTo(500);
    });
  });

  describe('updateAccount', () => {
    it('should throw NotFoundException if account not found', async () => {
      prismaMock.account.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAccount('missing-id', { name: 'New Name' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update and return the account', async () => {
      prismaMock.account.findUnique.mockResolvedValue(makeAccount());
      prismaMock.account.update.mockResolvedValue(
        makeAccount({ name: 'Updated' }),
      );

      const result = await service.updateAccount(
        accountId,
        { name: 'Updated' },
        userId,
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteAccount', () => {
    it('should throw ConflictException if account has transactions', async () => {
      prismaMock.account.findUnique.mockResolvedValue(makeAccount());
      prismaMock.transaction.count.mockResolvedValue(3);

      await expect(service.deleteAccount(accountId, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should delete account successfully when no transactions', async () => {
      prismaMock.account.findUnique.mockResolvedValue(makeAccount());
      prismaMock.transaction.count.mockResolvedValue(0);
      prismaMock.account.delete.mockResolvedValue(makeAccount());

      await expect(
        service.deleteAccount(accountId, userId),
      ).resolves.not.toThrow();
      expect(prismaMock.account.delete).toHaveBeenCalledWith({
        where: { id: accountId },
      });
    });
  });
});
