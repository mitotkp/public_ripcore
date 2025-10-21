import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService, SelectionTokenPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectCompanyDto } from './dto/select-company.dto';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginCoreDto } from './dto/login-core.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BlocklistService } from './blocklist.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly blocklistService: BlocklistService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Public()
  @Post('register/core')
  async registerCoreUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    const { password, ...result } = user;
    return result;
  }

  @Public()
  @Post('login/core')
  async loginCore(@Body() loginCoreDto: LoginCoreDto) {
    return this.authService.loginCore(loginCoreDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const autHeader = req.headers['authorization'];
    if (autHeader && autHeader.startsWith('Bearer ')) {
      const token = autHeader.substring(7);
      await this.blocklistService.addToBlocklist(token);
    }
    return { message: 'Sesión cerrada correctamente.' };
  }

  @Post('select-company')
  @UseGuards(AuthGuard('jwt-selection'))
  async selectCompany(
    @Req() req: Request,
    @Body() selectCompanyDto: SelectCompanyDto,
  ) {
    const userPayload = req.user as SelectionTokenPayload;

    return this.authService.selectCompany(userPayload, selectCompanyDto.dbName);
  }
}
