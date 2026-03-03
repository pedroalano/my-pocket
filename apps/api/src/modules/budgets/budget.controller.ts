import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetDto } from './dto/budget.dto';
import { BudgetWithSpendingDto } from './dto/budget-with-spending.dto';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';

@ApiTags('budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  @ApiResponse({
    status: 200,
    description: 'List of all budgets for the authenticated user',
    type: [BudgetDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getAllBudgets(@Request() req: AuthenticatedRequest) {
    return this.budgetService.getAllBudgets(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific budget by ID' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the budget to retrieve',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Budget found and returned successfully',
    type: BudgetDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async getBudgetById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.getBudgetById(id, req.user.userId);
  }

  @Get(':id/details')
  @ApiOperation({
    summary: 'Get budget with spending details',
    description:
      'Returns a budget with calculated spending data including spent amount, remaining amount, and utilization percentage',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the budget to retrieve with spending details',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Budget with spending calculations returned successfully',
    type: BudgetWithSpendingDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async getBudgetsWithTransactions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.getBudgetsWithTransactions(id, req.user.userId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get budgets by category' })
  @ApiParam({
    name: 'categoryId',
    description: 'The UUID of the category to filter budgets by',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'List of budgets for the specified category',
    type: [BudgetDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  getBudgetsByCategory(
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Request() req: AuthenticatedRequest,
  ): ReturnType<BudgetService['getBudgetsByCategory']> {
    return this.budgetService.getBudgetsByCategory(categoryId, req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
    type: BudgetDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid input data (e.g., month not in range 1-12)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Budget already exists for this category, month, and year',
  })
  async createBudget(
    @Body() budgetData: CreateBudgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.createBudget(budgetData, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing budget' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the budget to update',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    type: BudgetDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Budget already exists for this category, month, and year',
  })
  async updateBudget(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body()
    budgetData: UpdateBudgetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.updateBudget(id, budgetData, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the budget to delete',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Budget deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async deleteBudget(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.budgetService.deleteBudget(id, req.user.userId);
  }
}
