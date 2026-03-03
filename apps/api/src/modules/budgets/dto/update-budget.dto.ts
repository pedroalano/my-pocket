import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BudgetType } from '@prisma/client';

export class UpdateBudgetDto {
  @ApiProperty({
    description: 'Budget amount (must be positive)',
    example: 500.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
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
    description: 'Month of the budget (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  month?: number;

  @ApiProperty({
    description: 'Year of the budget',
    example: 2026,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({
    description: 'Budget type',
    enum: BudgetType,
    example: BudgetType.EXPENSE,
    required: false,
  })
  @IsOptional()
  @IsEnum(BudgetType)
  type?: BudgetType;
}
