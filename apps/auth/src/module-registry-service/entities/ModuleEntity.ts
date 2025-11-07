import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('modules')
export class RegistredModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  prefix: string;

  @Column({ type: 'varchar', length: 500, name: 'baseUrl' })
  baseUrl: string;

  @Column({ type: 'varchar', length: 500, name: 'frontendUrl', nullable: true })
  frontendUrl: string;

  @Column({ default: 1, name: 'is_enabled' })
  isEnabled: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
