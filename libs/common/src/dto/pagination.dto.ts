import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1, { message: 'La página debe ser como mínimo 1.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1, { message: 'El límite debe ser como mínimo 1.' })
  limit?: number = 50;

  @IsOptional()
  @IsString()
  filterAction?: string;

  @IsOptional()
  @IsString()
  filterUserId?: string;
}
