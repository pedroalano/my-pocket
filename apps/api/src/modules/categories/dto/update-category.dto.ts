import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto {
  //   @IsNumber()
  //   id: number;
  @ApiProperty({ description: 'The name of the category', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The type of the category (e.g., expense, income)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string;
}
