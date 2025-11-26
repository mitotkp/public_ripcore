import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateSettingDto {
  @ApiProperty({ example: 'APP_COLOR' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: '#000000' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
