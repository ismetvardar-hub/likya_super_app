import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyPoisQuery {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(50_000)
  radius?: number = 5000;
}

export class UploadGpxDto {
  @IsString()
  @IsNotEmpty({ message: 'gpx_xml zorunlu' })
  gpx_xml!: string;

  @IsOptional()
  @IsIn(['kolay', 'orta', 'zor'], { message: 'Geçersiz zorluk derecesi' })
  difficulty?: string = 'orta';
}

export class CreateSosDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsOptional()
  @IsString()
  message?: string = '';
}
