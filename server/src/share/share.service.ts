import { Injectable } from '@nestjs/common';
import { SSE_EVENT_TYPE } from '../../../shared/src/api/api-types-distribution';
import {
  AcceptShareRequestDto,
  CreateShareRequestDto,
  ModifyShareAccessRequestDto,
  RejectShareRequestDto,
  WithdrawShareRequestDto,
} from '../../../shared/src/api/api-types-share';
import { DistributionService } from '../distribution/distribution.service';
import { UserRepository } from '../user/user.repository';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { ShareRepository } from './share.repository';

@Injectable()
export class ShareService {
  constructor(
    private shareRepository: ShareRepository,
    private userRepository: UserRepository,
    private workspaceRepository: WorkspaceRepository,
    private distributionService: DistributionService,
  ) {
  }

  async getShareInfo({ sub }: { sub: string }) {
    const user = await this.userRepository.getUserBySub({ sub });

    return this.shareRepository.getShareInfo({ userId: user.id });
  }

  async createShare({ sub, mapId, shareEmail, shareAccess }: CreateShareRequestDto & { sub: string }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const share = await this.shareRepository.createShare({ userId: user.id, mapId, shareEmail, shareAccess });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_SHARE,
      payload: { shareId: share.id },
    });
  }

  async acceptShare({ shareId }: AcceptShareRequestDto) {
    await this.shareRepository.acceptShare({ shareId });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_SHARE,
      payload: { shareId },
    });
  }

  async modifyShareAccess({ shareId, shareAccess }: ModifyShareAccessRequestDto) {
    await this.shareRepository.modifyShareAccess({ shareId, shareAccess });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_SHARE,
      payload: { shareId },
    });
  }

  private async deleteShare({ shareId }: { shareId: number }) {
    const share = await this.shareRepository.getShare({ shareId });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_SHARE,
      payload: { shareId },
    });

    await this.shareRepository.deleteShare({ shareId });

    await this.workspaceRepository.removeUserMapFromWorkspaces({ userId: share.shareUserId, mapId: share.mapId });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_WORKSPACE,
      payload: {},
    });
  }

  async withdrawShare({ shareId }: WithdrawShareRequestDto) {
    await this.deleteShare({ shareId });
  }

  async rejectShare({ shareId }: RejectShareRequestDto) {
    await this.deleteShare({ shareId });
  }
}
