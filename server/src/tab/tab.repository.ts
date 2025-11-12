import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TabRepository {
  constructor(private prisma: PrismaService) {
  }

  async getTabByUser({ userId }: { userId: number }) {
    return this.prisma.tab.findFirstOrThrow({
      where: { User: { id: userId } },
      select: {
        mapIds: true,
      },
    });
  }

  async getTabsOfMap({ mapId }: { mapId: number }) {
    return this.prisma.tab.findMany({
      where: {
        mapIds: {
          has: mapId,
        },
      },
      select: {
        id: true,
      },
    });
  }

  async addMapToTab({ userId, mapId }: { userId: number; mapId: number }) {
    return this.prisma.tab.update({
      where: {
        userId,
      },
      data: {
        mapIds: {
          push: mapId,
        },
      },
      select: { id: true },
    });
  }

  async moveUpMapInTab({ userId, mapId }: { userId: number; mapId: number }) {
    const { id, mapIds } = await this.prisma.tab.findFirstOrThrow({
      where: { User: { id: userId } },
      select: { id: true, mapIds: true },
    });

    const i = mapIds.indexOf(mapId);
    if (i <= 0) return;

    [mapIds[i], mapIds[i - 1]] = [mapIds[i - 1], mapIds[i]];

    return this.prisma.tab.update({
      where: { id },
      data: { mapIds },
      select: { id: true },
    });
  }

  async moveDownMapInTab({ userId, mapId }: { userId: number; mapId: number }) {
    const { id, mapIds } = await this.prisma.tab.findFirstOrThrow({
      where: { User: { id: userId } },
      select: { id: true, mapIds: true },
    });

    const i = mapIds.indexOf(mapId);
    if (i === -1 || i === mapIds.length - 1) return;

    [mapIds[i], mapIds[i + 1]] = [mapIds[i + 1], mapIds[i]];

    return this.prisma.tab.update({
      where: { id },
      data: { mapIds },
      select: { id: true },
    });
  }

  async removeMapFromTab({ userId, mapId }: { userId: number; mapId: number }) {
    const tab = await this.prisma.tab.findUniqueOrThrow({
      where: { userId },
      select: { mapIds: true },
    });

    const updatedMapIds = tab.mapIds.filter(id => id !== mapId);

    return this.prisma.tab.update({
      where: { userId },
      data: {
        mapIds: {
          set: updatedMapIds,
        },
      },
      select: { id: true },
    });
  }
}
