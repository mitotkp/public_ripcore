import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  serverName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
