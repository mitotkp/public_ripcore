import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('blocklisted_tokens')
export class BlocklistedToken {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  jti: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;
}
