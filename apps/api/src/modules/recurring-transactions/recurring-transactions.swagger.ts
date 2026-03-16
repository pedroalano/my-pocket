import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecurringTransactionDto } from './dto/recurring-transaction.dto';

export function ApiGetAllRecurringTransactions() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all recurring transactions' }),
    ApiResponse({
      status: 200,
      description:
        'List of all recurring transactions for the authenticated user',
      type: [RecurringTransactionDto],
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
  );
}

export function ApiGetRecurringTransactionById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific recurring transaction by ID' }),
    ApiParam({
      name: 'id',
      description: 'The UUID of the recurring transaction to retrieve',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Recurring transaction found and returned successfully',
      type: RecurringTransactionDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({
      status: 404,
      description: 'Recurring transaction not found',
    }),
  );
}

export function ApiCreateRecurringTransaction() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new recurring transaction' }),
    ApiResponse({
      status: 201,
      description: 'Recurring transaction created successfully',
      type: RecurringTransactionDto,
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

export function ApiUpdateRecurringTransaction() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an existing recurring transaction' }),
    ApiParam({
      name: 'id',
      description: 'The UUID of the recurring transaction to update',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Recurring transaction updated successfully',
      type: RecurringTransactionDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid input data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({
      status: 404,
      description: 'Recurring transaction not found',
    }),
  );
}

export function ApiDeleteRecurringTransaction() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a recurring transaction' }),
    ApiParam({
      name: 'id',
      description: 'The UUID of the recurring transaction to delete',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Recurring transaction deleted successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({
      status: 404,
      description: 'Recurring transaction not found',
    }),
  );
}
