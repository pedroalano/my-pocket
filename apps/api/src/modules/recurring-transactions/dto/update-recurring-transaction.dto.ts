import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecurringInterval } from '@prisma/client';

export class UpdateRecurringTransactionDto {
  @ApiProperty({
    description: 'Transaction amount (must be positive)',
    example: 99.99,
    minimum: 0.01,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Description of the recurring transaction',
    example: 'Monthly Netflix subscription',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Recurrence interval',
    enum: RecurringInterval,
    example: RecurringInterval.MONTHLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(RecurringInterval)
  interval?: RecurringInterval;

  @ApiProperty({
    description: 'Start date in ISO 8601 format',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date in ISO 8601 format',
    example: '2026-12-31T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Whether the recurring transaction is active',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
