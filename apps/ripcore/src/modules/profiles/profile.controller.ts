import {
  Controller,
  Get,
  Body,
  Patch,
  //UseGuards,
  Request,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update.profile.dto';
//import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: number;
    email: string;
    name: string;
    roles: { name: string }[];
  };
}

@Controller('profiles')
//@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfileService) {}

  @Get('me')
  findOne(@Request() req: RequestWithUser) {
    //const fakeUserID = 1;
    return this.profilesService.findOneByUser(req.user.userId);
  }

  @Patch('me')
  update(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(req.user.userId, updateProfileDto);
  }
}
