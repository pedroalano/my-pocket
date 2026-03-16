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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecurringTransactionsService } from './recurring-transactions.service';
import {
  ApiGetAllRecurringTransactions,
  ApiGetRecurringTransactionById,
  ApiCreateRecurringTransaction,
  ApiUpdateRecurringTransaction,
  ApiDeleteRecurringTransaction,
} from './recurring-transactions.swagger';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';

@ApiTags('recurring-transactions')
@Controller('recurring-transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecurringTransactionsController {
  constructor(
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  @Get()
  @ApiGetAllRecurringTransactions()
  async getAll(@Request() req: AuthenticatedRequest) {
    return this.recurringTransactionsService.getAll(req.user.userId);
  }

  @Get(':id')
  @ApiGetRecurringTransactionById()
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recurringTransactionsService.getById(id, req.user.userId);
  }

  @Post()
  @ApiCreateRecurringTransaction()
  async create(
    @Body() dto: CreateRecurringTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recurringTransactionsService.create(dto, req.user.userId);
  }

  @Put(':id')
  @ApiUpdateRecurringTransaction()
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRecurringTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recurringTransactionsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @ApiDeleteRecurringTransaction()
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recurringTransactionsService.delete(id, req.user.userId);
  }
}
