import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './core/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'API is running successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
