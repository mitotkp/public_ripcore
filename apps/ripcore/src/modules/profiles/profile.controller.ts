import {
  Controller,
  Get,
  Body,
  Patch,
  //UseGuards,
  Request,
  Headers,
  //ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update.profile.dto';
//import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
//import { Request as ExpressRequest } from 'express';

// interface RequestWithUser extends ExpressRequest {
//   user: {
//     userId: number;
//     email: string;
//     name: string;
//     roles: { name: string }[];
//   };
// }

@Controller('profiles')
//@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfileService) {}

  @Get('me')
  findOne(@Headers('X-User-ID') userIdHeader: string) {
    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid or missing X-USer-ID header');
    }
    return this.profilesService.findOneByUser(userId);
  }

  @Patch('me')
  update(
    @Headers('X-User-ID') userIdHeader: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid or missing X-User-ID header');
    }

    return this.profilesService.update(userId, updateProfileDto);
  }
}
