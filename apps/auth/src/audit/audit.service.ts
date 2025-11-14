import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
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
    // --- LÓGICA DE FILTRO MEJORADA ---
    const { page = 1, limit = 50, filterAction, filterUserId } = paginationDto;
    const skip = (page - 1) * limit;

    // 1. Construye la consulta 'where' dinámicamente
    const where: FindOptionsWhere<Audit> = {};
    if (filterAction) {
      where.action = Like(`%${filterAction}%`); // Busca acciones que contengan el texto
    }
    if (filterUserId) {
      where.userId = filterUserId; // Busca por ID de usuario exacto
    }

    // 2. Aplica 'where' a la consulta
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where, // <-- Aplica los filtros
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
    });
    // --- FIN DE LA LÓGICA MEJORADA ---

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
