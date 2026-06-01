import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';
import {
  GetDashboardQueryDto,
  GetTopExpensesQueryDto,
} from './dto/get-dashboard-query.dto';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockUserId = 'user-123';
  const mockReq = {
    user: { userId: mockUserId, email: 'test@example.com', name: 'Test User' },
  } as unknown as AuthenticatedRequest;

  const query = (month: number, year: number): GetDashboardQueryDto =>
    ({ month, year }) as GetDashboardQueryDto;

  const topQuery = (
    month: number,
    year: number,
    limit = 10,
  ): GetTopExpensesQueryDto => ({ month, year, limit }) as GetTopExpensesQueryDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getMonthlySummary: jest.fn(),
            getBudgetVsActual: jest.fn(),
            getCategoryBreakdown: jest.fn(),
            getTopExpenses: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should apply JwtAuthGuard at the controller level', () => {
    const guards = Reflect.getMetadata('__guards__', DashboardController) ?? [];
    expect(guards).toContain(JwtAuthGuard);
  });

  describe('getMonthlySummary', () => {
    const summary = {
      totalIncome: 5000,
      totalExpense: 2000,
      balance: 3000,
      totalBudgetIncome: 0,
      totalBudgetExpense: 0,
      budgetBalance: 0,
    };

    it('should delegate to service with userId and query params', async () => {
      jest.spyOn(service, 'getMonthlySummary').mockResolvedValue(summary);

      const result = await controller.getMonthlySummary(mockReq, query(2, 2026));

      expect(result).toEqual(summary);
      expect(service.getMonthlySummary).toHaveBeenCalledWith(mockUserId, 2, 2026);
    });

    it('should return zero values when no transactions exist', async () => {
      const empty = { totalIncome: 0, totalExpense: 0, balance: 0, totalBudgetIncome: 0, totalBudgetExpense: 0, budgetBalance: 0 };
      jest.spyOn(service, 'getMonthlySummary').mockResolvedValue(empty);

      const result = await controller.getMonthlySummary(mockReq, query(3, 2026));
      expect(result).toEqual(empty);
    });
  });

  describe('getBudgetVsActual', () => {
    it('should delegate to service with userId and query params', async () => {
      const expected = [{ categoryId: 'cat-1', category: { id: 'cat-1', name: 'Food', type: 'EXPENSE' }, budget: 1000, actual: 500, difference: 500, percentageUsed: 50 }];
      jest.spyOn(service, 'getBudgetVsActual').mockResolvedValue(expected as any);

      const result = await controller.getBudgetVsActual(mockReq, query(2, 2026));

      expect(result).toEqual(expected);
      expect(service.getBudgetVsActual).toHaveBeenCalledWith(mockUserId, 2, 2026);
    });

    it('should return empty array when no budgets exist', async () => {
      jest.spyOn(service, 'getBudgetVsActual').mockResolvedValue([]);
      const result = await controller.getBudgetVsActual(mockReq, query(6, 2026));
      expect(result).toEqual([]);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should delegate to service with userId and query params', async () => {
      const expected = [{ categoryId: 'cat-1', category: { id: 'cat-1', name: 'Food', type: 'EXPENSE' }, totalAmount: 500, percentage: 100 }];
      jest.spyOn(service, 'getCategoryBreakdown').mockResolvedValue(expected as any);

      const result = await controller.getCategoryBreakdown(mockReq, query(3, 2026));

      expect(result).toEqual(expected);
      expect(service.getCategoryBreakdown).toHaveBeenCalledWith(mockUserId, 3, 2026);
    });

    it('should return empty array when no expenses exist', async () => {
      jest.spyOn(service, 'getCategoryBreakdown').mockResolvedValue([]);
      const result = await controller.getCategoryBreakdown(mockReq, query(4, 2026));
      expect(result).toEqual([]);
    });
  });

  describe('getTopExpenses', () => {
    const expenses = [
      { id: 'tx-1', description: 'Rent', date: '2026-03-01T00:00:00.000Z', amount: 1500, category: { id: 'cat-1', name: 'Housing', type: 'EXPENSE' } },
    ];

    it('should delegate to service with default limit of 10', async () => {
      jest.spyOn(service, 'getTopExpenses').mockResolvedValue(expenses as any);

      const result = await controller.getTopExpenses(mockReq, topQuery(3, 2026));

      expect(result).toEqual(expenses);
      expect(service.getTopExpenses).toHaveBeenCalledWith(mockUserId, 3, 2026, 10);
    });

    it('should pass custom limit to service', async () => {
      jest.spyOn(service, 'getTopExpenses').mockResolvedValue(expenses as any);

      await controller.getTopExpenses(mockReq, topQuery(3, 2026, 5));

      expect(service.getTopExpenses).toHaveBeenCalledWith(mockUserId, 3, 2026, 5);
    });

    it('should return empty array when no expenses exist', async () => {
      jest.spyOn(service, 'getTopExpenses').mockResolvedValue([]);
      const result = await controller.getTopExpenses(mockReq, topQuery(4, 2026));
      expect(result).toEqual([]);
    });
  });
});
