import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DeleteEdgeRequestDto, InsertEdgeRequestDto } from '../../../shared/src/api/api-types-edge';
import { JwtAuthGuard } from '../check-jwt.guard';
import { EdgeService } from './edge.service';

@Controller()
export class EdgeController {
  constructor(private readonly edgeService: EdgeService) {
  }

  @Post('insert-edge')
  @UseGuards(JwtAuthGuard)
  async insertEdge(@Body() params: InsertEdgeRequestDto) {
    await this.edgeService.insertEdge(params);
  }

  @Post('delete-edge')
  @UseGuards(JwtAuthGuard)
  async deleteEdge(@Body() params: DeleteEdgeRequestDto) {
    await this.edgeService.deleteEdge(params);
  }
}
