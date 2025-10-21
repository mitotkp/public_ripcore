import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class Audit {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', nullable: true, name: 'user_id' })
  userId: string | null;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'target_entity',
  })
  targetEntity: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'target_id' })
  targetId: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
