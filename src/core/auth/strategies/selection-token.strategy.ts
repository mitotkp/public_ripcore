import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface SelectionTokenPayload {
  codUsuario: string;
  usuario: string;
  tenantName: string;
  type: 'company-selection';
}

interface ValidatedSelectionPayload {
  codUsuario: string;
  usuario: string;
  tenantName: string;
}

@Injectable()
export class SelectionTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-selection',
) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error(
        'JWT_SECRET no está definido en la configuración. La autenticación no puede funcionar.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: SelectionTokenPayload): ValidatedSelectionPayload | null {
    if (payload.type !== 'company-selection') {
      return null;
    }
    return {
      codUsuario: payload.codUsuario,
      usuario: payload.usuario,
      tenantName: payload.tenantName,
    };
  }
}
