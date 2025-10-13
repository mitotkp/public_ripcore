import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from '../tenant/tenant.service';
import { TenantConnectionManager } from '../tenant/tenant-connection.manager';
import { UsersService } from '../users/users.service';
import { EncryptionHelper } from './helpers/encryption.helper';
import { LoginDto } from './dto/login.dto';
import { LoginCoreDto } from './dto/login-core.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

export interface ExternalDbUser {
  CODUSUARIO: string;
  USUARIO: string;
  DB: string;
}

export interface SelectionTokenPayload {
  codUsuario: string;
  usuario: string;
  tenantName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly connectionManager: TenantConnectionManager,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly encryptionHelper: EncryptionHelper,
    private readonly mailService: MailService,
  ) {}

  async loginCore(
    loginCoreDto: LoginCoreDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = loginCoreDto;
    const user = await this.usersService.findByEmail(email);

    const encryptedPassword = this.encryptionHelper.encriptar(password);

    if (!user || user.password !== encryptedPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      tenant: 'coreDatabase',
      dbName: null,
      roles: user.roles.map((role) => role.name),
      jti: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ companies: string[]; selectionToken: string }> {
    const { serverName, password } = loginDto;
    const encryptedPassword = this.encryptionHelper.encriptar(password);
    const tenant = this.tenantService.findByName(serverName);
    const tenantConnection = await this.connectionManager.getConnection(tenant);

    const query = `
      SELECT DISTINCT U.CODUSUARIO, U.USUARIO, SUBSTRING(EM.PATHBD, CHARINDEX(':', EM.PATHBD) + 1, LEN(EM.PATHBD)) AS DB 
      FROM USUARIOS U
      INNER JOIN EMPRESASUSUARIO EMU ON EMU.CODUSUARIO = U.CODUSUARIO
      INNER JOIN EMPRESAS EM ON EM.CODEMPRESA = EMU.CODEMPRESA
      WHERE U.NEWPASS = @0`;

    const results: ExternalDbUser[] = await tenantConnection.query(query, [
      encryptedPassword,
    ]);

    if (!results || results.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const companies = results.map((result) => result.DB);
    const firstResult = results[0];

    const selectionPayload: SelectionTokenPayload = {
      codUsuario: firstResult.CODUSUARIO,
      usuario: firstResult.USUARIO,
      tenantName: serverName,
    };

    const selectionToken = this.jwtService.sign(
      { ...selectionPayload, type: 'company-selection' },
      { expiresIn: '10m' },
    );

    return { companies, selectionToken };
  }

  async selectCompany(
    userFromSelectionToken: SelectionTokenPayload,
    selectDbName: string,
  ): Promise<{ accessToken: string }> {
    const externalUser = {
      CODUSUARIO: userFromSelectionToken.codUsuario,
      USUARIO: userFromSelectionToken.usuario,
    };

    const coreUser = await this.usersService.findOrCreateFromExternal(
      externalUser,
      userFromSelectionToken.tenantName,
    );

    const payload = {
      sub: coreUser.id,
      name: coreUser.name,
      tenant: coreUser.tenantName,
      dbName: selectDbName,
      jti: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        message:
          'Si existe una cuenta con ese correo, se ha enviado un enlace para reestablecer la contraseña.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.password_reset_token = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    user.password_reset_expires = new Date(Date.now() + 10 * 60 * 1000);

    await this.usersService.save(user);

    await this.mailService.sendPasswordResetEmail(user, token);

    return {
      message:
        'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      throw new UnauthorizedException('El token es inválido o ha expirado.');
    }

    user.password = this.encryptionHelper.encriptar(password);

    user.password_reset_token = null;
    user.password_reset_expires = null;

    await this.usersService.save(user);

    return { message: 'La contraseña ha sido restablecida exitosamente.' };
  }
}
