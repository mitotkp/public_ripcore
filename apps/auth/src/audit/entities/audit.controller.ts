import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../audit.service';
import { PaginationDto } from '@app/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.auditService.findAll(paginationDto);
  }
}
