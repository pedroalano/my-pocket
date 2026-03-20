import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransactionDto } from './dto/transaction.dto';

export function ApiGetAllTransactions() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all transactions' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 20)',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      enum: ['INCOME', 'EXPENSE'],
      description: 'Filter by transaction type',
    }),
    ApiQuery({
      name: 'categoryId',
      required: false,
      type: String,
      description: 'Filter by category UUID',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      description: 'Filter from date (ISO 8601)',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      description: 'Filter to date (ISO 8601)',
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of transactions for the authenticated user',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
  );
}

export function ApiGetTransactionById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific transaction by ID' }),
    ApiParam({
      name: 'id',
      description: 'The UUID of the transaction to retrieve',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Transaction found and returned successfully',
      type: TransactionDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({ status: 404, description: 'Transaction not found' }),
  );
}

export function ApiCreateTransaction() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new transaction' }),
    ApiResponse({
      status: 201,
      description: 'Transaction created successfully',
      type: TransactionDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
  );
}

export function ApiUpdateTransaction() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an existing transaction' }),
    ApiParam({
      name: 'id',
      description: 'The UUID of the transaction to update',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Transaction updated successfully',
      type: TransactionDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({ status: 404, description: 'Transaction not found' }),
  );
}

export function ApiDeleteTransaction() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a transaction' }),
    ApiParam({
      name: 'id',
      description: 'The UUID of the transaction to delete',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Transaction deleted successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({ status: 404, description: 'Transaction not found' }),
  );
}
