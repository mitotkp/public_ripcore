import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail(
    {},
    { message: 'Por favor, introduce un correo electrónico válido.' },
  )
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email: string;
}
