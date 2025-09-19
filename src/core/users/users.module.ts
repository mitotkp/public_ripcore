import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from '../users.controller';
import { AuditModule } from '../audit/audit.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User], 'default'), AuditModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
