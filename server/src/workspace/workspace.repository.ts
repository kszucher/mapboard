import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspaceRepository {
  constructor(private prisma: PrismaService) {
  }

  async createWorkspace({ userId, mapId }: { userId: number; mapId: number }) {
    return this.prisma.workspace.create({
      data: { userId, mapId },
      select: { id: true },
    });
  }

  async getWorkspaceById({ workspaceId }: { workspaceId: number }) {
    return this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId, mapId: { not: null } },
      select: {
        mapId: true,
        userId: true,
      },
    });
  }

  async getWorkspacesOfUser({ userId }: { userId: number }) {
    return this.prisma.workspace.findMany({
      where: { User: { id: userId } },
      select: { id: true },
    });
  }

  async getWorkspacesOfMap({ mapId }: { mapId: number }) {
    return this.prisma.workspace.findMany({
      where: { Map: { id: mapId } },
      select: { id: true },
    });
  }

  async getWorkspacesWithNoMap() {
    return this.prisma.workspace.findMany({
      where: { Map: null },
      select: { id: true },
    });
  }

  async getWorkspacesOfTab({ tabId }: { tabId: number }) {
    return this.prisma.workspace.findMany({
      where: { User: { Tab: { id: tabId } } },
      select: { id: true },
    });
  }

  async getWorkspacesOfShare({ shareId }: { shareId: number }) {
    return this.prisma.workspace.findMany({
      where: {
        OR: [
          {
            User: {
              SharesByMe: {
                some: { id: shareId },
              },
            },
          },
          {
            User: {
              SharesWithMe: {
                some: { id: shareId },
              },
            },
          },
        ],
      },
      select: { id: true },
    });
  }

  async addMapToWorkspace({ workspaceId, mapId }: { workspaceId: number; mapId: number }) {
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { mapId },
    });
  }

  async removeUserMapFromWorkspaces({ userId, mapId }: { userId: number; mapId: number }): Promise<void> {
    await this.prisma.workspace.updateMany({
      where: { userId, mapId },
      data: {
        mapId: null,
      },
    });
  }

  async removeMapFromWorkspaces({ mapId }: { mapId: number }): Promise<void> {
    await this.prisma.workspace.updateMany({
      where: { mapId },
      data: {
        mapId: null,
      },
    });
  }

  async deleteWorkspace({ workspaceId }: { workspaceId: number }) {
    try {
      await this.prisma.workspace.delete({ where: { id: workspaceId } });
    } catch (e) {
      console.error('delete workspace error');
    }
  }

  async deleteWorkspacesAll() {
    await this.prisma.workspace.deleteMany();
  }
}
