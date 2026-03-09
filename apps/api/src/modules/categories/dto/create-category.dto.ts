import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'The name of the category' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The type of the category (e.g., expense, income)',
  })
  @IsString()
  @MaxLength(20)
  type: string;
}
