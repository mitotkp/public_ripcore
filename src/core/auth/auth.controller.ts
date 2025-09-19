import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService, SelectionTokenPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectCompanyDto } from './dto/select-company.dto';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginCoreDto } from './dto/login-core.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

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

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
