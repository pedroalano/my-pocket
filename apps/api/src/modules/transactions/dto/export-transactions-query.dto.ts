import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class ExportTransactionsQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
