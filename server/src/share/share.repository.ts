import { Injectable } from '@nestjs/common';
import { ShareAccess, ShareStatus } from '../generated/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShareRepository {
  constructor(private prisma: PrismaService) {
  }

  async getShareInfo({ userId }: { userId: number }) {
    return this.prisma.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      select: {
        SharesByMe: {
          select: {
            id: true,
            mapId: true,
            access: true,
            status: true,
            Map: {
              select: {
                name: true,
              },
            },
            ShareUser: {
              select: {
                email: true,
              },
            },
          },
        },
        SharesWithMe: {
          select: {
            id: true,
            mapId: true,
            access: true,
            status: true,
            Map: {
              select: {
                name: true,
              },
            },
            OwnerUser: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getShare({ shareId }: { shareId: number }) {
    return this.prisma.share.findFirstOrThrow({
      where: { id: shareId },
      select: {
        ownerUserId: true,
        shareUserId: true,
        mapId: true,
        access: true,
        OwnerUser: { select: { name: true } },
        ShareUser: { select: { name: true } },
        Map: { select: { name: true } },
      },
    });
  }

  async getShareAccess({ shareUserId, mapId }: { shareUserId: number; mapId: number }) {
    const share = await this.prisma.share.findFirstOrThrow({
      where: { shareUserId, mapId },
      select: { access: true },
    });

    return share.access;
  }

  async getSharesOfMap({ mapId }: { mapId: number }) {
    return this.prisma.share.findMany({
      where: { mapId },
      select: { id: true },
    });
  }

  async createShare({
                      userId,
                      mapId,
                      shareEmail,
                      shareAccess,
                    }: {
    userId: number;
    mapId: number;
    shareEmail: string;
    shareAccess: ShareAccess;
  }) {
    const shareUser = await this.prisma.user.findUniqueOrThrow({
      where: { email: shareEmail },
      select: { id: true },
    });

    const existingShare = await this.prisma.share.findFirst({
      where: {
        mapId,
        ownerUserId: userId,
        shareUserId: shareUser.id,
      },
    });

    if (existingShare) {
      throw new Error('Share already exists');
    }

    return this.prisma.share.create({
      data: {
        mapId,
        ownerUserId: userId,
        shareUserId: shareUser.id,
        access: shareAccess,
        status: ShareStatus.WAITING,
      },
      select: {
        id: true,
        ownerUserId: true,
        shareUserId: true,
        OwnerUser: { select: { name: true } },
        Map: { select: { name: true } },
      },
    });
  }

  async acceptShare({ shareId }: { shareId: number }) {
    return this.prisma.share.update({
      where: { id: shareId },
      data: { status: ShareStatus.ACCEPTED },
    });
  }

  async modifyShareAccess({ shareId, shareAccess }: { shareId: number; shareAccess: ShareAccess }) {
    return this.prisma.share.update({
      where: { id: shareId },
      data: { access: shareAccess },
    });
  }

  async deleteShare({ shareId }: { shareId: number }) {
    await this.prisma.share.delete({ where: { id: shareId } });
  }

  async deleteSharesOfMap({ mapId }: { mapId: number }) {
    await this.prisma.share.deleteMany({ where: { mapId } });
  }
}
