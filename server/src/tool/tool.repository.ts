import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToolRepository {
  constructor(private prisma: PrismaService) {
  }

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

  async removeTool() {
  }
}
