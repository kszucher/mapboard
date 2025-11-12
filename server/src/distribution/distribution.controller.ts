import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { DistributionService } from './distribution.service';

@Controller()
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {
  }

  @Get('workspace_events/:workspaceId')
  handleWorkspaceEvents(
    @Req() req: Request,
    @Res() res: Response,
    @Param('workspaceId') workspaceId: string,
  ) {
    const id = Number(workspaceId);
    this.distributionService.addClient(req, res, id);
  }
}
