import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class BudgetVsActualCategoryDto {
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

export class BudgetVsActualDto {
  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category details',
    type: BudgetVsActualCategoryDto,
  })
  category: BudgetVsActualCategoryDto;

  @ApiProperty({
    description: 'Budgeted amount for the category',
    example: 500.0,
  })
  budget: number;

  @ApiProperty({
    description: 'Actual spent amount',
    example: 350.0,
  })
  actual: number;

  @ApiProperty({
    description:
      'Difference between budget and actual (positive = under budget)',
    example: 150.0,
  })
  difference: number;

  @ApiProperty({
    description: 'Percentage of budget used',
    example: 70.0,
  })
  percentageUsed: number;
}
