import { ApiProperty } from '@nestjs/swagger';

export class RecurringTransactionDto {
  @ApiProperty({
    description: 'The unique identifier of the recurring transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the recurring transaction',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Description of the recurring transaction',
    example: 'Monthly Netflix subscription',
  })
  description: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: '99.99',
    type: 'string',
  })
  amount: string;

  @ApiProperty({
    description: 'Transaction type derived from category',
    example: 'EXPENSE',
  })
  type: string;

  @ApiProperty({
    description: 'Recurrence interval',
    example: 'MONTHLY',
  })
  interval: string;

  @ApiProperty({
    description: 'Start date in ISO 8601 format',
    example: '2026-01-01T00:00:00.000Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'Next scheduled run date in ISO 8601 format',
    example: '2026-02-01T00:00:00.000Z',
  })
  nextRun: string;

  @ApiProperty({
    description: 'Optional end date in ISO 8601 format',
    example: '2026-12-31T00:00:00.000Z',
    required: false,
  })
  endDate?: string;

  @ApiProperty({
    description: 'Whether the recurring transaction is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Timestamp when the recurring transaction was created',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Timestamp when the recurring transaction was last updated',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}
