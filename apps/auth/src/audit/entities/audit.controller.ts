import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../audit.service';
//import { PaginationDto } from 'src/core/shared/dto/pagination.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
//import { PaginationDto } from 'apps/ripcore/src/core/shared/dto/pagination.dto';
//import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
//import { PermissionsGuard } from 'src/core/auth/guards/permissions.guard';
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
