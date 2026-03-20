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

  @ApiProperty({
    description: 'Total budgeted income for the month',
    example: 5000.0,
  })
  totalBudgetIncome: number;

  @ApiProperty({
    description: 'Total budgeted expenses for the month',
    example: 3500.0,
  })
  totalBudgetExpense: number;

  @ApiProperty({
    description: 'Budget balance (budgetIncome - budgetExpense)',
    example: 1500.0,
  })
  budgetBalance: number;
}
