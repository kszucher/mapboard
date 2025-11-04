import { injectable } from 'tsyringe';
import { PrismaClient } from '../generated/client';

@injectable()
export class ToolRepository {
  constructor(private prisma: PrismaClient) {}

  async getTool() {
    return this.prisma.tool.findMany({
      select: {
        id: true,
        w: true,
        h: true,
        color: true,
        label: true,
      },
    });
  }

  async createTool() {
    // TODO
  }

  async removeTool() {}
}
