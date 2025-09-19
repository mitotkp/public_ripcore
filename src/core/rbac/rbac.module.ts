import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { Role } from './entities/role.entity';
import { User } from '../users/user.entity';
import { Permission } from './entities/permission.entity';
import { RbacController } from './rbac.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Permission])],
  providers: [RbacService],
  controllers: [RbacController],
})
export class RbacModule {}
