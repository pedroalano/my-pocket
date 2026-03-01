import { ApiProperty } from '@nestjs/swagger';

export class MonthlySummaryDto {
  @ApiProperty({
    description: 'Total income for the month',
    example: 5000.0,
  })
  totalIncome: number;

  @ApiProperty({
    description: 'Total expenses for the month',
    example: 3500.0,
  })
  totalExpense: number;

  @ApiProperty({
    description: 'Balance (income - expenses)',
    example: 1500.0,
  })
  balance: number;
}
