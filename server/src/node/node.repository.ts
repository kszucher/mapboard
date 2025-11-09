import { injectable } from 'tsyringe';
import { Prisma, PrismaClient } from '../generated/client';

@injectable()
export class NodeRepository {
  constructor(private prisma: PrismaClient) {}

  async getNodes({ mapId }: { mapId: number }) {
    return this.prisma.node.findMany({
      where: { mapId },
      omit: { createdAt: true },
    });
  }

  async getNodesForSorting({ mapId }: { mapId: number }) {
    return this.prisma.node.findMany({
      where: { mapId },
      include: {
        Tool: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async copyNodes({ mapId }: { mapId: number }) {
    return this.prisma.node.findMany({
      where: { mapId },
      omit: {
        mapId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateNode({
    nodeId,
    workspaceId,
    params,
  }: {
    nodeId: number;
    workspaceId: number;
    params: Prisma.NodeUncheckedUpdateInput;
  }) {
    return this.prisma.node.update({
      where: { id: nodeId },
      data: { ...params, workspaceId },
    });
  }

  async setProcessing({ workspaceId, mapId, nodeId }: { workspaceId: number; mapId: number; nodeId: number }) {
    return this.prisma.$transaction([
      this.prisma.node.update({
        where: { id: nodeId },
        data: { workspaceId, isProcessing: true },
        select: { id: true, workspaceId: true, isProcessing: true, updatedAt: true },
      }),
      this.prisma.node.updateManyAndReturn({
        where: { id: { not: nodeId }, mapId },
        data: { workspaceId, isProcessing: false },
        select: { id: true, workspaceId: true, isProcessing: true, updatedAt: true },
      }),
    ]);
  }

  async clearProcessing({ workspaceId, mapId }: { workspaceId: number; mapId: number }) {
    return this.prisma.node.updateManyAndReturn({
      where: { mapId },
      data: { workspaceId, isProcessing: false },
      select: { id: true, workspaceId: true, isProcessing: true, updatedAt: true },
    });
  }

  async clearProcessingAll() {
    await this.prisma.node.updateMany({ data: { workspaceId: null, isProcessing: false } });
  }

  async clearResults({ workspaceId, mapId }: { workspaceId: number; mapId: number }) {
    return this.prisma.node.updateManyAndReturn({
      where: { mapId },
      data: {
        workspaceId,
      },
      select: {
        id: true,
        workspaceId: true,
        updatedAt: true,
      },
    });
  }

  async createNode({ mapId, toolId }: { mapId: number; toolId: number }) {
    const result = await this.prisma.node.aggregate({
      where: { mapId },
      _max: {
        iid: true,
        offsetX: true,
        offsetY: true,
      },
    });

    return this.prisma.node.create({
      data: {
        mapId,
        toolId,
        iid: (result._max.iid || 0) + 1,
        offsetX: (result._max.offsetX || 0) + 200,
        offsetY: (result._max.offsetY || 0) + 200,
      },
      omit: { createdAt: true },
    });
  }

  async createNodes({ mapId, nodes }: { mapId: number; nodes: Prisma.NodeUncheckedCreateInput[] }) {
    return this.prisma.node.createManyAndReturn({
      data: nodes.map(n => ({
        ...n,
        mapId,
      })),
      select: { id: true },
    });
  }

  async deleteNode({ nodeId }: { nodeId: number }) {
    await this.prisma.node.delete({
      where: { id: nodeId },
    });
  }

  async deleteNodesOfMap({ mapId }: { mapId: number }) {
    await this.prisma.node.deleteMany({ where: { mapId } });
  }
}
