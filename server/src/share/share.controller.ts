import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  AcceptShareRequestDto,
  CreateShareRequestDto,
  GetShareInfoQueryResponseDto,
  ModifyShareAccessRequestDto,
  RejectShareRequestDto,
  WithdrawShareRequestDto,
} from '../../../shared/src/api/api-types-share';
import { JwtAuthGuard } from '../check-jwt.guard';
import { ShareService } from './share.service';

@Controller()
export class ShareController {
  constructor(private readonly shareService: ShareService) {
  }

  @Post('get-share-info')
  @UseGuards(JwtAuthGuard)
  async getShareInfo(@Req() req: Request): Promise<GetShareInfoQueryResponseDto> {
    const sub = req.auth?.payload?.sub ?? '';
    return this.shareService.getShareInfo({ sub });
  }

  @Post('create-share')
  @UseGuards(JwtAuthGuard)
  async createShare(@Req() req: Request, @Body() params: CreateShareRequestDto) {
    const sub = req.auth?.payload?.sub ?? '';
    await this.shareService.createShare({ sub, ...params });
  }

  @Post('accept-share')
  @UseGuards(JwtAuthGuard)
  async acceptShare(@Body() params: AcceptShareRequestDto) {
    await this.shareService.acceptShare(params);
  }

  @Post('withdraw-share')
  @UseGuards(JwtAuthGuard)
  async withdrawShare(@Body() params: WithdrawShareRequestDto) {
    await this.shareService.withdrawShare(params);
  }

  @Post('reject-share')
  @UseGuards(JwtAuthGuard)
  async rejectShare(@Body() params: RejectShareRequestDto) {
    await this.shareService.rejectShare(params);
  }

  @Post('modify-share-access')
  @UseGuards(JwtAuthGuard)
  async modifyShareAccess(@Body() params: ModifyShareAccessRequestDto) {
    await this.shareService.modifyShareAccess(params);
  }
}
