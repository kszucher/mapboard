import { Injectable } from '@nestjs/common';
import { MapRepository } from '../map/map.repository';
import { TabRepository } from '../tab/tab.repository';
import { UserRepository } from '../user/user.repository';
import { WorkspaceRepository } from './workspace.repository';

@Injectable()
export class WorkspaceService {
  constructor(
    private workspaceRepository: WorkspaceRepository,
    private userRepository: UserRepository,
    private mapRepository: MapRepository,
    private tabRepository: TabRepository,
  ) {
  }

  async createWorkspace({ sub }: { sub: string }) {
    const user = await this.userRepository.getUserBySub({ sub });

    let map = await this.mapRepository.getLastMapOfUser({ userId: user.id });
    if (!map) {
      map = await this.mapRepository.createMap({ userId: user.id, mapName: 'New Map' });
      await this.tabRepository.addMapToTab({ userId: user.id, mapId: map.id });
    }

    await this.userRepository.incrementSignInCount({ userId: user.id });

    return await this.workspaceRepository.createWorkspace({ userId: user.id, mapId: map.id });
  }

  async updateWorkspaceMap({ workspaceId, mapId }: { workspaceId: number; mapId: number }) {
    await this.workspaceRepository.addMapToWorkspace({ workspaceId, mapId });
  }

  async deleteWorkspaces() {
    await this.workspaceRepository.deleteWorkspacesAll();
  }
}
