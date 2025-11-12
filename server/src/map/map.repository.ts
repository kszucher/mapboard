import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapRepository {
  constructor(private prisma: PrismaService) {
  }

  async getMap({ mapId }: { mapId: number }) {
    return this.prisma.map.findUniqueOrThrow({
      where: { id: mapId },
      select: {
        id: true,
        userId: true,
        name: true,
      },
    });
  }

  async getMapsById({ mapIds }: { mapIds: number[] }) {
    return this.prisma.map.findMany({
      where: { id: { in: mapIds } },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getLastMapOfUser({ userId }: { userId: number }) {
    return this.prisma.map.findFirst({
      where: { userId },
      orderBy: {
        updatedAt: 'desc',
      },
      select: { id: true },
    });
  }

  async getMapName({ mapId }: { mapId: number }) {
    return this.prisma.map.findUniqueOrThrow({
      where: { id: mapId },
      select: { name: true },
    });
  }

  async createMap({ userId, mapName }: { userId: number; mapName: string }) {
    return this.prisma.map.create({
      data: {
        userId,
        name: mapName,
      },
      select: {
        id: true,
        name: true,
        userId: true,
      },
    });
  }

  async renameMap({ mapId, mapName }: { mapId: number; mapName: string }) {
    await this.prisma.map.update({
      where: { id: mapId },
      data: { name: mapName },
    });
  }

  async incrementOpenCount({ mapId }: { mapId: number }) {
    await this.prisma.map.update({
      where: { id: mapId },
      data: {
        openCount: {
          increment: 1,
        },
      },
    });
  }

  async deleteMap({ mapId }: { mapId: number }) {
    await this.prisma.map.delete({ where: { id: mapId } });
  }
}
