import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDashboardQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year: number;
}

export class GetTopExpensesQueryDto extends GetDashboardQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
