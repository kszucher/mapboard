import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GetUserInfoQueryResponseDto } from '../../../shared/src/api/api-types-user';
import { JwtAuthGuard } from '../check-jwt.guard';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post('get-user-info')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: Request): Promise<GetUserInfoQueryResponseDto> {
    const sub = req.auth?.payload.sub ?? '';
    const user = await this.userService.getUserBySub({ sub });
    return { userInfo: user };
  }

  // TODO: toggleColorMode
  // TODO: deleteAccount
}
