import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { BlocklistedToken } from './entities/blocklisted-token.entity';

interface DecodedToken {
  jti: string;
  exp: number;
}

@Injectable()
export class BlocklistService {
  constructor(
    @InjectRepository(BlocklistedToken, 'default')
    private blocklistRepository: Repository<BlocklistedToken>,
    private jwtService: JwtService,
  ) {}

  async addToBlocklist(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as DecodedToken;
    if (decoded && decoded.jti && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      const newBlockedToken = this.blocklistRepository.create({
        jti: decoded.jti,
        expiresAt,
      });
      await this.blocklistRepository.save(newBlockedToken);
      console.log(
        `Token ${decoded.jti} añadido a la blocklist de la base de datos.`,
      );
    }
  }

  async isBlocklisted(jti: string): Promise<boolean> {
    const token = await this.blocklistRepository.findOneBy({ jti });
    return !!token;
  }

  async clearExpiredToken(): Promise<void> {
    await this.blocklistRepository.delete({ expiresAt: new Date() });
  }
}
