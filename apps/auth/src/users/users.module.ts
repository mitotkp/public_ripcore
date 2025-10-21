import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditModule } from '../audit/audit.module';
import { TenantDbModule } from '../auth/tenant/tenant-db.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'default'),
    AuditModule,
    TenantDbModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
