import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail(
    {},
    { message: 'Por favor, introduce un correo electrónico válido.' },
  )
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  email: string;
}
