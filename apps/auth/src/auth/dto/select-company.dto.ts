import { IsString, IsNotEmpty } from 'class-validator';

export class SelectCompanyDto {
  @IsString()
  @IsNotEmpty()
  dbName: string;
}
