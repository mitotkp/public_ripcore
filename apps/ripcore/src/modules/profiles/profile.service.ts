import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//import { User } from 'src/core/users/user.entity';
import { Profile } from './entities/profile.entity';
//import { UsersService } from 'src/core/users/users.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    //private usersService: UsersService,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
  ) {}

  async findOneByUser(userId: number): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({
      //where: { user: { id: userId } },
      where: { userId: userId },
    });

    if (profile) {
      return profile;
    }

    //const newProfileData: Partial<Profile> = {};

    //newProfileData.user = { id: userId } as any;
    const newProfile = this.profilesRepository.create({
      userId: userId,
    });

    //const user = await this.usersService.findOne(userId);
    //const newProfile = this.profilesRepository.create({ user });
    //const newProfile = this.profilesRepository.create(newProfileData);

    return this.profilesRepository.save(newProfile);
  }

  async update(
    userId: number,
    updateProfileDto: Partial<Profile>,
  ): Promise<Profile> {
    const profile = await this.findOneByUser(userId);

    delete updateProfileDto.userId;

    Object.assign(profile, updateProfileDto);

    this.auditClient.emit('log_audit', {
      action: 'update_profile_user',
      targetEntity: 'profile',
      targetId: `${userId.toString()}`,
      details: { profile: profile },
    });

    return this.profilesRepository.save(profile);
  }
}
