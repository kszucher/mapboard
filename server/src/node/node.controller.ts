import { Request, Response, Router } from 'express';
import { injectable } from 'tsyringe';
import { DeleteNodeRequestDto, InsertNodeRequestDto, MoveNodeRequestDto } from '../../../shared/src/api/api-types-node';
import { checkJwt, getWorkspaceId } from '../middleware';
import { NodeService } from './node.service';

@injectable()
export class NodeController {
  public router: Router;

  constructor(private nodeService: NodeService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/insert-node', checkJwt, getWorkspaceId, this.insertNode.bind(this));
    this.router.post('/move-node', checkJwt, getWorkspaceId, this.moveNode.bind(this));
    this.router.post('/delete-node', checkJwt, getWorkspaceId, this.deleteNode.bind(this));
  }

  private async insertNode(req: Request, res: Response) {
    const params: InsertNodeRequestDto = req.body;
    await this.nodeService.insertNode(params);
    res.json();
  }

  private async moveNode(req: Request, res: Response) {
    const { workspaceId } = req as any;
    const params: MoveNodeRequestDto = req.body;
    await this.nodeService.moveNode({ workspaceId, ...params });
    res.json();
  }

  private async deleteNode(req: Request, res: Response) {
    const params: DeleteNodeRequestDto = req.body;
    await this.nodeService.deleteNode(params);
    res.json();
  }
}
