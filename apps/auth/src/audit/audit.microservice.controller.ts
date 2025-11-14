import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';

interface LogPayload {
  userId?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  details?: Record<string, any>;
}

@Controller()
export class AuditMicroserviceController {
  constructor(private readonly auditService: AuditService) {}

  @MessagePattern('log_audit')
  async handleAuditLog(@Payload() payload: LogPayload) {
    try {
      await this.auditService.log(payload);
    } catch (error) {
      console.error('Error al guardar log de auditoría:', error, payload);
    }
  }
}
