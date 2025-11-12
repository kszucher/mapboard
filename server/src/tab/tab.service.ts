import { Injectable } from '@nestjs/common';
import { SSE_EVENT_TYPE } from '../../../shared/src/api/api-types-distribution';
import { DistributionService } from '../distribution/distribution.service';
import { MapRepository } from '../map/map.repository';
import { UserRepository } from '../user/user.repository';
import { TabRepository } from './tab.repository';

@Injectable()
export class TabService {
  constructor(
    private tabRepository: TabRepository,
    private userRepository: UserRepository,
    private mapRepository: MapRepository,
    private distributionService: DistributionService,
  ) {
  }

  async getOrderedMapsOfTab({ sub }: { sub: string }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const tab = await this.tabRepository.getTabByUser({ userId: user.id });

    const maps = await this.mapRepository.getMapsById({ mapIds: tab.mapIds });

    const idToMap = new Map(maps.map(map => [map.id, map]));

    return tab.mapIds.map(id => {
      const map = idToMap.get(id);
      if (!map) {
        throw new Error(`Map with id ${id} not found`);
      }
      return map;
    });
  }

  async moveUpMapInTab({ sub, mapId }: { sub: string; mapId: number }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const tab = await this.tabRepository.moveUpMapInTab({ userId: user.id, mapId });

    if (!tab) return;

    await this.distributionService.publish({ type: SSE_EVENT_TYPE.INVALIDATE_TAB, payload: { tabId: tab.id } });
  }

  async moveDownMapInTab({ sub, mapId }: { sub: string; mapId: number }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const tab = await this.tabRepository.moveDownMapInTab({ userId: user.id, mapId });

    if (!tab) return;

    await this.distributionService.publish({ type: SSE_EVENT_TYPE.INVALIDATE_TAB, payload: { tabId: tab.id } });
  }
}
