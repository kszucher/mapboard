import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateToolRequestDto, GetToolQueryResponseDto } from '../../../shared/src/api/api-types-tool';
import { JwtAuthGuard } from '../check-jwt.guard';
import { ToolService } from './tool.service';

@Controller()
export class ToolController {
  constructor(private readonly toolService: ToolService) {
  }

  @Post('get-tool-info')
  @UseGuards(JwtAuthGuard)
  async getToolInfo(): Promise<GetToolQueryResponseDto> {
    return this.toolService.getTool();
  }

  @Post('create-tool')
  @UseGuards(JwtAuthGuard)
  async createTool(@Body() params: CreateToolRequestDto) {
    await this.toolService.createTool();
  }
}
