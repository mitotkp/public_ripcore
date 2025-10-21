import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { ProfilesController } from './profile.controller';
//import { UsersModule } from 'src/core/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    //UsersModule
  ],
  controllers: [ProfilesController],
  providers: [ProfileService],
})
export class ProfilesModule {}
