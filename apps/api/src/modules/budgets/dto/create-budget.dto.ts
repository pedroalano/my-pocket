import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Budget amount (must be positive)',
    example: 500.0,
    minimum: 0.01,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Month of the budget (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  month: number;

  @ApiProperty({
    description: 'Year of the budget',
    example: 2026,
  })
  @IsNumber()
  year: number;

  @ApiProperty({
    description: 'Optional notes about the budget',
    example: 'Monthly grocery target',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
