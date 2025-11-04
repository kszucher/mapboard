import { injectable } from 'tsyringe';
import { ToolRepository } from './tool.repository';

@injectable()
export class ToolService {
  constructor(private toolRepository: ToolRepository) {}

  async getTool() {
    return this.toolRepository.getTool();
  }

  async createTool() {
    return this.toolRepository.createTool();
  }

  async removeTool() {
    return this.toolRepository.removeTool();
  }
}
