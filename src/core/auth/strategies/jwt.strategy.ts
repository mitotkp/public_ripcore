import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/core/users/users.service';
import { RequestUser } from '../interfaces/request-user.interface';

// Define la estructura del payload del token para tener tipado fuerte
interface JwtPayload {
  sub: number;
  name: string;
  tenant: string;
  dbName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.secret');

    // Lanza un error si el secreto JWT no está configurado
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en el archivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        'El usuario perteneciente a este token ya no existe.',
      );
    }

    return {
      id: user.id,
      name: user.name,
      tenantName: payload.tenant,
      dbName: payload.dbName,
    };
  }
}
