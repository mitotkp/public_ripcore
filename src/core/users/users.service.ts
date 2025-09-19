import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { EncryptionHelper } from '../auth/helpers/encryption.helper';

// interface UserPayload {
//   userId: number;
//   email: string;
//   roles: { name: string }[];
// }

interface ExternalUser {
  CODUSUARIO: string;
  USUARIO: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'default')
    private usersRepository: Repository<User>,
    private auditService: AuditService,
    private readonly encryptionHelper: EncryptionHelper,
  ) {}

  //Crear usuario de forma externa
  async findOrCreateFromExternal(
    externalUser: ExternalUser,
    tenantName: string,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        externalId: externalUser.CODUSUARIO,
        tenantName: tenantName,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const newUser = this.usersRepository.create({
      externalId: externalUser.CODUSUARIO,
      name: externalUser.USUARIO,
      tenantName: tenantName,
      // Aquí puedes asignar roles por defecto si lo necesitas
    });

    return this.usersRepository.save(newUser);
  }

  //Crea un usuario
  async create(createUserDto: CreateUserDto): Promise<User> {
    const encryptedPassword = this.encryptionHelper.encriptar(
      createUserDto.password,
    );

    // Aqui se crea una nueva instancia de usuario con la contraseña hasheada
    const newUser = this.usersRepository.create({
      ...CreateUserDto,
      password: encryptedPassword,
    });

    await this.usersRepository.save(newUser);
    Logger.log(newUser);

    // 3. REGISTRA LA ACCIÓN DE AUDITORÍA
    await this.auditService.log({
      action: 'user_created',
      targetEntity: 'users',
      targetId: newUser.id.toString(),
      details: { email: newUser.email }, // Guarda detalles extra si quieres
    });

    return newUser;
  }

  //Aqui se comienzan a escribir los métodos de los usuarios
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      take: limit,
      skip: skip,
      relations: ['roles'],
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  // Busca por email para el proceso de login
  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  // Actualizar datos de un usuario
  async update(
    id: number,
    UpdateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    // `preload` busca el usuario y lo fusiona con los nuevos datos
    const isAdmin = currentUser.roles.some(
      (role) => role.name === 'Admin' || role.name === 'SuperAdmin',
    );

    if (!isAdmin && Number(currentUser.id) !== Number(id)) {
      throw new UnauthorizedException(
        'No tienes permiso para editar este usuario.',
      );
    }

    if (UpdateUserDto.password) {
      const salt = await bcrypt.genSalt();
      UpdateUserDto.password = await bcrypt.hash(UpdateUserDto.password, salt);
    }

    const user = await this.usersRepository.preload({
      id: id,
      ...UpdateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return this.usersRepository.save(user);
  }

  // Borrar un usuario
  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
  }

  /**
   * Busca un usuario por su token de reseteo hasheado y verifica que no haya expirado.
   * @param token El token de reseteo hasheado.
   * @returns El usuario encontrado o null.
   */
  async findByResetToken(token: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: MoreThan(new Date()), // La fecha de expiración debe ser mayor a la fecha actual
      },
    });
    return user;
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findOneWithRelations(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }
}
