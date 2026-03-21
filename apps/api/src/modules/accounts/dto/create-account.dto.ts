import { IsString, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name', example: 'Main Checking' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountType, description: 'Account type' })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ description: 'Initial balance', example: 1000 })
  @IsNumber()
  @Min(0)
  initialBalance: number;
}
