import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PayDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  ref_type?: string = '';

  @IsOptional()
  @IsString()
  ref_id?: string = '';
}

export class RedeemCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
