import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@prisma/client';

export class CategoryBreakdownItemDto {
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

export class CategoryBreakdownDto {
  @ApiProperty({
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category details',
    type: CategoryBreakdownItemDto,
  })
  category: CategoryBreakdownItemDto;

  @ApiProperty({
    description: 'Total amount spent in this category',
    example: 350.0,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Percentage of total expenses',
    example: 25.5,
  })
  percentage: number;
}
