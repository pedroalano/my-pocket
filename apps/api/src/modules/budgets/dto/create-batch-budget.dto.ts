import { IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBatchBudgetDto {
  @ApiProperty({ example: 500.0 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  startMonth: number;

  @ApiProperty({ example: 2026 })
  @IsNumber()
  startYear: number;

  @ApiProperty({ example: 12, minimum: 1, maximum: 12 })
  @IsNumber()
  @Min(1)
  @Max(12)
  endMonth: number;

  @ApiProperty({ example: 2026 })
  @IsNumber()
  endYear: number;
}
