import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiGetMonthlySummary,
  ApiGetBudgetVsActual,
  ApiGetCategoryBreakdown,
  ApiGetTopExpenses,
} from './dashboard.swagger';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { BudgetVsActualDto } from './dto/budget-vs-actual.dto';
import { MonthlySummaryDto } from './dto/monthly-summary.dto';
import { CategoryBreakdownDto } from './dto/category-breakdown.dto';
import { TopExpenseDto } from './dto/top-expenses.dto';
import {
  GetDashboardQueryDto,
  GetTopExpensesQueryDto,
} from './dto/get-dashboard-query.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('monthly-summary')
  @ApiGetMonthlySummary()
  async getMonthlySummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetDashboardQueryDto,
  ): Promise<MonthlySummaryDto> {
    return this.dashboardService.getMonthlySummary(
      req.user.userId,
      query.month,
      query.year,
    );
  }

  @Get('budget-vs-actual')
  @ApiGetBudgetVsActual()
  async getBudgetVsActual(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetDashboardQueryDto,
  ): Promise<BudgetVsActualDto[]> {
    return this.dashboardService.getBudgetVsActual(
      req.user.userId,
      query.month,
      query.year,
    );
  }

  @Get('category-breakdown')
  @ApiGetCategoryBreakdown()
  async getCategoryBreakdown(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetDashboardQueryDto,
  ): Promise<CategoryBreakdownDto[]> {
    return this.dashboardService.getCategoryBreakdown(
      req.user.userId,
      query.month,
      query.year,
    );
  }

  @Get('top-expenses')
  @ApiGetTopExpenses()
  async getTopExpenses(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetTopExpensesQueryDto,
  ): Promise<TopExpenseDto[]> {
    return this.dashboardService.getTopExpenses(
      req.user.userId,
      query.month,
      query.year,
      query.limit,
    );
  }
}
