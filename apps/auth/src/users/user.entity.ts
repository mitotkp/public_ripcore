import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  //OneToOne,
  JoinTable,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../rbac/entities/role.entity';
//import { Role } from '../../../ripcore/src/core/rbac/entities/role.entity';
//import { Profile } from 'apps/ripcore/src/modules/profiles/entities/profile.entity';

@Entity('users')
@Index(['externalId', 'tenantName'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password_reset_token: string | null;

  @Exclude()
  @Column({ type: 'datetime', nullable: true })
  password_reset_expires: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tenantName: string;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_has_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  //@OneToOne(() => Profile, (profile) => profile.user)
  //profile: Profile;
}
