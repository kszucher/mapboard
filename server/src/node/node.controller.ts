import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  DeleteNodeRequestDto,
  InsertNodeRequestDto,
  MoveNodeRequestDto,
} from '../../../shared/src/api/api-types-node';
import { JwtAuthGuard } from '../check-jwt.guard';
import { WorkspaceId } from '../workspace-id.decorator';
import { NodeService } from './node.service';

@Controller()
export class NodeController {
  constructor(private readonly nodeService: NodeService) {
  }

  @Post('insert-node')
  @UseGuards(JwtAuthGuard)
  async insertNode(@Body() params: InsertNodeRequestDto) {
    await this.nodeService.insertNode(params);
  }

  @Post('move-node')
  @UseGuards(JwtAuthGuard)
  async moveNode(
    @WorkspaceId() workspaceId: number,
    @Body() params: MoveNodeRequestDto,
  ) {
    await this.nodeService.moveNode({ workspaceId, ...params });
  }

  @Post('delete-node')
  @UseGuards(JwtAuthGuard)
  async deleteNode(@Body() params: DeleteNodeRequestDto) {
    await this.nodeService.deleteNode(params);
  }
}
