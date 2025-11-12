import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CreateWorkspaceResponseDto, UpdateWorkspaceMapRequestDto } from '../../../shared/src/api/api-types-workspace';
import { JwtAuthGuard } from '../check-jwt.guard';
import { WorkspaceId } from '../workspace-id.decorator';
import { WorkspaceService } from './workspace.service';

@Controller()
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {
  }

  @Post('create-workspace')
  @UseGuards(JwtAuthGuard)
  async createWorkspace(@Req() req: Request): Promise<CreateWorkspaceResponseDto> {
    const sub = req.auth?.payload.sub ?? '';
    const workspace = await this.workspaceService.createWorkspace({ sub });
    return { workspaceId: workspace.id };
  }

  @Post('update-workspace-map')
  @UseGuards(JwtAuthGuard)
  async updateWorkspaceMap(
    @Body() params: UpdateWorkspaceMapRequestDto,
    @WorkspaceId() workspaceId: number,
  ) {
    const { mapId } = params;
    await this.workspaceService.updateWorkspaceMap({ workspaceId, mapId });
  }
}
