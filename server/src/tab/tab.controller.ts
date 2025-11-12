import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  GetTabInfoQueryResponseDto,
  MoveDownMapInTabRequestDto,
  MoveUpMapInTabRequestDto,
} from '../../../shared/src/api/api-types-tab';
import { JwtAuthGuard } from '../check-jwt.guard';
import { TabService } from './tab.service';

@Controller()
export class TabController {
  constructor(private readonly tabService: TabService) {
  }

  @Post('get-tab-info')
  @UseGuards(JwtAuthGuard)
  async getTabInfo(@Req() req: Request): Promise<GetTabInfoQueryResponseDto> {
    const sub = req.auth?.payload?.sub ?? '';
    return this.tabService.getOrderedMapsOfTab({ sub });
  }

  @Post('move-up-map-in-tab')
  @UseGuards(JwtAuthGuard)
  async moveUpMap(
    @Req() req: Request,
    @Body() params: MoveUpMapInTabRequestDto,
  ) {
    const sub = req.auth?.payload?.sub ?? '';
    await this.tabService.moveUpMapInTab({ sub, mapId: params.mapId });
  }

  @Post('move-down-map-in-tab')
  @UseGuards(JwtAuthGuard)
  async moveDownMap(
    @Req() req: Request,
    @Body() params: MoveDownMapInTabRequestDto,
  ) {
    const sub = req.auth?.payload?.sub ?? '';
    await this.tabService.moveDownMapInTab({ sub, mapId: params.mapId });
  }
}
