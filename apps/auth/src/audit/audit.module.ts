import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { AuditService } from './audit.service';
import { AuditController } from './entities/audit.controller';
import { AuditMicroserviceController } from './audit.microservice.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Audit], 'default')],
  providers: [AuditService],
  controllers: [AuditController, AuditMicroserviceController],
  exports: [AuditService],
})
export class AuditModule {}
