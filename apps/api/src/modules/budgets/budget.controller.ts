import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Request,
  Res,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { BudgetService } from './budget.service';
import {
  ApiGetAllBudgets,
  ApiGetBudgetById,
  ApiGetBudgetDetails,
  ApiGetBudgetsByCategory,
  ApiCreateBudget,
  ApiCreateBatchBudget,
  ApiUpdateBudget,
  ApiDeleteBudget,
} from './budget.swagger';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CreateBatchBudgetDto } from './dto/create-batch-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { GetBudgetsQueryDto } from './dto/get-budgets-query.dto';
import { ExportBudgetsQueryDto } from './dto/export-budgets-query.dto';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';

function resolveLang(header?: string): string {
  if (!header) return 'en';
  const first = header.split(',')[0]?.trim().toLowerCase() ?? 'en';
  if (first.startsWith('pt')) return 'pt-BR';
  return 'en';
}

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiGetAllBudgets()
  getAllBudgets(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetBudgetsQueryDto,
  ): ReturnType<BudgetService['getAllBudgets']> {
    return this.budgetService.getAllBudgets(req.user.userId, query);
  }

  @Get('export')
  async exportBudgets(
    @Request() req: AuthenticatedRequest,
    @Query() query: ExportBudgetsQueryDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const lang = resolveLang(acceptLanguage);
    const csv = await this.budgetService.exportBudgets(
      req.user.userId,
      query,
      lang,
    );
    const filename = `budgets-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get(':id')
  @ApiGetBudgetById()
  async getBudgetById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.getBudgetById(id, req.user.userId);
  }

  @Get(':id/details')
  @ApiGetBudgetDetails()
  async getBudgetsWithTransactions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.getBudgetsWithTransactions(id, req.user.userId);
  }

  @Get('category/:categoryId')
  @ApiGetBudgetsByCategory()
  getBudgetsByCategory(
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Request() req: AuthenticatedRequest,
  ): ReturnType<BudgetService['getBudgetsByCategory']> {
    return this.budgetService.getBudgetsByCategory(categoryId, req.user.userId);
  }

  @Post('batch')
  @ApiCreateBatchBudget()
  async createBatchBudget(
    @Body() dto: CreateBatchBudgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.createBatchBudgets(dto, req.user.userId);
  }

  @Post()
  @ApiCreateBudget()
  async createBudget(
    @Body() budgetData: CreateBudgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.createBudget(budgetData, req.user.userId);
  }

  @Put(':id')
  @ApiUpdateBudget()
  async updateBudget(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body()
    budgetData: UpdateBudgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.updateBudget(id, budgetData, req.user.userId);
  }

  @Delete(':id')
  @ApiDeleteBudget()
  async deleteBudget(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.deleteBudget(id, req.user.userId);
  }
}
