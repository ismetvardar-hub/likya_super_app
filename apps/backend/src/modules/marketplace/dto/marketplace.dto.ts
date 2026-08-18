import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMarketOrderDto {
  @IsString()
  @IsNotEmpty()
  product_id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total!: number;

  @IsOptional()
  @IsString()
  address?: string = '';
}
