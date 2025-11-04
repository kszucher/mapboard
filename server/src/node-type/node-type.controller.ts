import { Request, Response, Router } from 'express';
import { injectable } from 'tsyringe';
import { CreateToolRequestDto, GetToolQueryResponseDto } from '../../../shared/src/api/api-types-node-type';
import { checkJwt, getWorkspaceId } from '../middleware';
import { ToolService } from './node-type.service';

@injectable()
export class ToolController {
  public router: Router;

  constructor(private toolService: ToolService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/get-node-type-info', checkJwt, getWorkspaceId, this.getToolInfo.bind(this));
    this.router.post('/create-node-type', checkJwt, getWorkspaceId, this.createTool.bind(this));
  }

  private async getToolInfo(req: Request, res: Response) {
    const response: GetToolQueryResponseDto = await this.toolService.getTool();
    res.json(response);
  }

  private async createTool(req: Request, res: Response) {
    const params: CreateToolRequestDto = req.body;
    await this.toolService.createTool();
    res.json();
  }
}
