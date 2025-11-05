import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
//(import { UsersService } from 'src/core/users/users.service';
import { UsersService } from '../../users/users.service';
//import { RequestUser } from '../interfaces/request-user.interface';
//import { User } from 'src/core/users/user.entity';
import { User } from '../../users/user.entity';
import { BlocklistService } from '../blocklist.service';

// Define la estructura del payload del token para tener tipado fuerte
interface JwtPayload {
  sub: number;
  name: string;
  tenant: string;
  dbName: string;
  jti: string;
}

type UserWithSessionInfo = User & { dbName: string; tenantName: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private blocklistService: BlocklistService,
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

  async validate(payload: JwtPayload): Promise<UserWithSessionInfo> {
    const isBlocked = await this.blocklistService.isBlocklisted(payload.jti);
    if (isBlocked) {
      throw new UnauthorizedException('El token ha sido invalidado.');
    }

    const user = await this.usersService.findOneWithRelations(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        'El usuario perteneciente a este token ya no existe.',
      );
    }

    return {
      ...user,
      dbName: payload.dbName,
      tenantName: payload.tenant,
    };
  }
}
