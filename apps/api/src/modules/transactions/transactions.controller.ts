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
import { TransactionsService } from './transactions.service';
import {
  ApiGetAllTransactions,
  ApiGetTransactionById,
  ApiCreateTransaction,
  ApiUpdateTransaction,
  ApiDeleteTransaction,
} from './transactions.swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { ExportTransactionsQueryDto } from './dto/export-transactions-query.dto';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auths/interfaces/authenticated-request.interface';
import { resolveLang } from '../shared/utils/resolve-lang';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiGetAllTransactions()
  getAllTransactions(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetTransactionsQueryDto,
  ): ReturnType<TransactionsService['getAllTransactions']> {
    return this.transactionsService.getAllTransactions(req.user.userId, query);
  }

  @Get('export')
  async exportTransactions(
    @Request() req: AuthenticatedRequest,
    @Query() query: ExportTransactionsQueryDto,
    @Headers('accept-language') acceptLanguage: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const lang = resolveLang(acceptLanguage);
    const csv = await this.transactionsService.exportTransactions(
      req.user.userId,
      query,
      lang,
    );
    const filename = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get(':id')
  @ApiGetTransactionById()
  async getTransactionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.getTransactionById(id, req.user.userId);
  }

  @Post()
  @ApiCreateTransaction()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.createTransaction(
      createTransactionDto,
      req.user.userId,
    );
  }

  @Put(':id')
  @ApiUpdateTransaction()
  async updateTransaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.updateTransaction(
      id,
      updateTransactionDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiDeleteTransaction()
  async deleteTransaction(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.transactionsService.deleteTransaction(id, req.user.userId);
  }
}
