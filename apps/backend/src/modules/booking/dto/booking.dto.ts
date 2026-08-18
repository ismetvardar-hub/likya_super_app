import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailableQuery {
  @IsIn(['tur', 'tekne', 'parasut', 'etkinlik'], { message: 'Geçersiz rezervasyon tipi' })
  type!: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CreateBookingDto {
  @IsIn(['tur', 'tekne', 'parasut', 'etkinlik'], { message: 'Geçersiz rezervasyon tipi' })
  type!: string;

  @IsString()
  @IsNotEmpty()
  service_id!: string;

  @IsDateString()
  slot_ts!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  party_size!: number;
}
