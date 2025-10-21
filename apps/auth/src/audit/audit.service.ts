import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { PaginationDto } from '../shared/dto/pagination.dto';
//import { PaginationDto } from '../shared/dto/pagination.dto';

// Interfaz para definir la estructura de un log
interface LogPayload {
  userId?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  details?: Record<string, any>; // Para un objeto JSON
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private auditLogRepository: Repository<Audit>,
  ) {}

  async log(payload: LogPayload): Promise<void> {
    // Creamos una nueva instancia de la entidad
    const newLog = new Audit();

    // Asignamos las propiedades del payload una por una
    newLog.userId = payload.userId || null;
    newLog.action = payload.action;
    newLog.targetEntity = payload.targetEntity || null;
    newLog.targetId = payload.targetId || null;
    newLog.details = payload.details ? JSON.stringify(payload.details) : null;

    // Guardamos la nueva entidad. TypeORM se encargará de dejar que la BD
    // genere el 'id' y el 'createdAt' automáticamente.
    await this.auditLogRepository.save(newLog);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC', // Ordenamos los logs del más reciente al más antiguo
      },
    });

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
