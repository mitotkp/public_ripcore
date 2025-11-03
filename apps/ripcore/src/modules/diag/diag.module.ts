import { Module } from '@nestjs/common';
import { DiagController } from './diag.controller';

@Module({
  controllers: [DiagController],
})
export class DiagModule {}
