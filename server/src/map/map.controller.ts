import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  CreateMapInTabDuplicateRequestDto,
  CreateMapInTabRequestDto,
  DeleteMapRequestDto,
  ExecuteMapRequestDto,
  GetMapInfoQueryResponseDto,
  RenameMapRequestDto,
} from '../../../shared/src/api/api-types-map';
import { JwtAuthGuard } from '../check-jwt.guard';
import { WorkspaceId } from '../workspace-id.decorator';
import { MapService } from './map.service';

@Controller()
export class MapController {
  constructor(private readonly mapService: MapService) {
  }

  @Post('get-map-info')
  @UseGuards(JwtAuthGuard)
  async getMapInfo(@WorkspaceId() workspaceId: number): Promise<GetMapInfoQueryResponseDto> {
    return this.mapService.getWorkspaceMapInfo({ workspaceId });
  }

  @Post('create-map-in-tab')
  @UseGuards(JwtAuthGuard)
  async createMapInTab(
    @WorkspaceId() workspaceId: number,
    @Body() params: CreateMapInTabRequestDto,
    @Body('sub') sub: string,
  ) {
    await this.mapService.createMapInTabNew({
      sub,
      workspaceId,
      ...params,
    });
  }

  @Post('create-map-in-tab-duplicate')
  @UseGuards(JwtAuthGuard)
  async createMapInTabDuplicate(
    @WorkspaceId() workspaceId: number,
    @Body() params: CreateMapInTabDuplicateRequestDto,
    @Body('sub') sub: string,
  ) {
    await this.mapService.createMapInTabDuplicate({
      sub,
      workspaceId,
      ...params,
    });
  }

  @Post('rename-map')
  @UseGuards(JwtAuthGuard)
  async renameMap(@Body() params: RenameMapRequestDto) {
    await this.mapService.renameMap(params);
  }

  @Post('execute-map')
  @UseGuards(JwtAuthGuard)
  async executeMap(
    @WorkspaceId() workspaceId: number,
    @Body() params: ExecuteMapRequestDto,
  ) {
    await this.mapService.executeMap({ workspaceId, ...params });
  }

  @Post('delete-map')
  @UseGuards(JwtAuthGuard)
  async deleteMap(@Body() params: DeleteMapRequestDto, @Body('sub') sub: string) {
    await this.mapService.deleteMap({ sub, ...params });
  }
}
