import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class TopExpenseCategoryDto {
  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Food',
  })
  name: string;

  @ApiProperty({
    description: 'Category type',
    enum: ['INCOME', 'EXPENSE'],
    example: 'EXPENSE',
  })
  type: CategoryType;
}

export class TopExpenseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Transaction description',
    example: 'Grocery shopping',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Transaction date',
    example: '2026-03-01',
  })
  date: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 150.0,
  })
  amount: number;

  @ApiProperty({
    description: 'Category details',
    type: TopExpenseCategoryDto,
  })
  category: TopExpenseCategoryDto;
}
