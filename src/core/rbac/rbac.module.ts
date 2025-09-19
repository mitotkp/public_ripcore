import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { Role } from './entities/role.entity';
import { User } from '../users/user.entity';
import { Permission } from './entities/permission.entity';
import { RbacController } from './rbac.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Permission], 'default')],
  providers: [RbacService],
  controllers: [RbacController],
  exports: [RbacService],
})
export class RbacModule {}
