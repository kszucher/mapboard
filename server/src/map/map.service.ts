import { injectable } from 'tsyringe';
import { SSE_EVENT_TYPE } from '../../../shared/src/api/api-types-distribution';
import { getTopologicalSort } from '../../../shared/src/map/map-getters';
import { M, ShareAccess } from '../../../shared/src/schema/schema';
import { DistributionService } from '../distribution/distribution.service';
import { EdgeRepository } from '../edge/edge.repository';
import { NodeRepository } from '../node/node.repository';
import { ShareRepository } from '../share/share.repository';
import { TabRepository } from '../tab/tab.repository';
import { UserRepository } from '../user/user.repository';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { MapRepository } from './map.repository';

@injectable()
export class MapService {
  constructor(
    private userRepository: UserRepository,
    private mapRepository: MapRepository,
    private nodeRepository: NodeRepository,
    private edgeRepository: EdgeRepository,
    private tabRepository: TabRepository,
    private shareRepository: ShareRepository,
    private workspaceRepository: WorkspaceRepository,
    private distributionService: DistributionService
  ) {}

  async getWorkspaceMapInfo({ workspaceId }: { workspaceId: number }): Promise<{
    id: number;
    name: string;
    data: M;
    shareAccess: ShareAccess;
  }> {
    const workspace = await this.workspaceRepository.getWorkspaceById({ workspaceId });

    const map = await this.mapRepository.getMap({ mapId: workspace.mapId! });

    const nodes = await this.nodeRepository.getNodes({ mapId: workspace.mapId! });

    const edges = await this.edgeRepository.getEdges({ mapId: workspace.mapId! });

    await this.mapRepository.incrementOpenCount({ mapId: map.id });

    const shareAccess =
      workspace.userId === map.userId
        ? ShareAccess.EDIT
        : await this.shareRepository.getShareAccess({
            shareUserId: workspace.userId,
            mapId: map.id,
          });

    return {
      id: map.id,
      name: map.name,
      data: { n: nodes, e: edges },
      shareAccess,
    };
  }

  private async createMapCommon({
    userId,
    workspaceId,
    mapId,
  }: {
    userId: number;
    workspaceId: number;
    mapId: number;
  }) {
    const tab = await this.tabRepository.addMapToTab({ userId, mapId });

    await this.workspaceRepository.addMapToWorkspace({ workspaceId, mapId });

    await this.distributionService.publish({ type: SSE_EVENT_TYPE.INVALIDATE_TAB, payload: { tabId: tab.id } });
  }

  async createMapInTabNew({ sub, workspaceId, mapName }: { sub: string; workspaceId: number; mapName: string }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const newMap = await this.mapRepository.createMap({ userId: user.id, mapName });

    await this.createMapCommon({ userId: user.id, workspaceId, mapId: newMap.id });
  }

  async createMapInTabDuplicate({ sub, workspaceId, mapId }: { sub: string; workspaceId: number; mapId: number }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const originalMap = await this.mapRepository.getMapName({ mapId });

    const copyNodes = await this.nodeRepository.copyNodes({ mapId });

    const copyEdges = await this.edgeRepository.copyEdges({ mapId });

    const newMap = await this.mapRepository.createMap({ userId: user.id, mapName: originalMap.name + ' (Copy)' });

    const newNodes = await this.nodeRepository.createNodes({
      mapId: newMap.id,
      nodes: copyNodes.map(({ id, ...rest }) => ({ ...rest, mapId: newMap.id })),
    });

    const nodeIdMap = new Map(copyNodes.map((n, i) => [n.id, newNodes[i].id]));

    await this.edgeRepository.createEdges({
      mapId: newMap.id,
      edges: copyEdges.map(({ id, fromNodeId, toNodeId, schema, ...rest }) => ({
        ...rest,
        mapId: newMap.id,
        fromNodeId: nodeIdMap.get(fromNodeId)!,
        toNodeId: nodeIdMap.get(toNodeId)!,
      })),
    });

    await this.createMapCommon({ userId: user.id, workspaceId, mapId: newMap.id });
  }

  async renameMap({ mapId, mapName }: { mapId: number; mapName: string }) {
    await this.mapRepository.renameMap({ mapId, mapName });

    const tabs = await this.tabRepository.getTabsOfMap({ mapId });

    for (const tab of tabs) {
      await this.distributionService.publish({ type: SSE_EVENT_TYPE.INVALIDATE_TAB, payload: { tabId: tab.id } });
    }

    await this.distributionService.publish({ type: SSE_EVENT_TYPE.INVALIDATE_MAP, payload: { mapId } });

    const shares = await this.shareRepository.getSharesOfMap({ mapId });

    for (const share of shares) {
      await this.distributionService.publish({
        type: SSE_EVENT_TYPE.INVALIDATE_SHARE,
        payload: { shareId: share.id },
      });
    }
  }

  async executeMap({ workspaceId, mapId }: { workspaceId: number; mapId: number }) {
    const nodesForSorting = await this.nodeRepository.getNodesForSorting({ mapId });

    const edgesForSorting = await this.edgeRepository.getEdgesForSorting({ mapId });

    const topologicalSort = getTopologicalSort({ n: nodesForSorting, e: edgesForSorting });
    if (!topologicalSort) {
      throw new Error('topological sort error');
    }

    const nodes = await this.nodeRepository.clearResults({ workspaceId, mapId });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
      payload: { mapId, nodes: { update: nodes } },
    });

    for (const nodeId of topologicalSort) {
      const ni = nodesForSorting.find(ni => ni.id === nodeId)!;

      const [activeNode, inactiveNodes] = await this.nodeRepository.setProcessing({ workspaceId, mapId, nodeId });

      await this.distributionService.publish({
        type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
        payload: { mapId, nodes: { update: [activeNode, ...inactiveNodes] } },
      });

      try {
        // switch (ni.Tool.type) {
        //   case 'FILE': {
        //     await new Promise(el => setTimeout(el, 2000));
        //     await this.executeFileService.execute({ mapId, nodeId });
        //     break;
        //   }
        //   case 'INGESTION': {
        //     await this.executeIngestionService.execute({ workspaceId, mapId, nodeId });
        //     break;
        //   }
        //   case 'CONTEXT': {
        //     await new Promise(el => setTimeout(el, 2000));
        //     await this.executeContextService.execute({ mapId, nodeId });
        //     break;
        //   }
        //   case 'QUESTION': {
        //     await new Promise(el => setTimeout(el, 2000));
        //     await this.executeQuestionService.execute({ mapId, nodeId });
        //     break;
        //   }
        //   case 'VECTOR_DATABASE': {
        //     await this.executeVectorDatabaseService.execute({ workspaceId, mapId, nodeId });
        //     break;
        //   }
        //   case 'DATA_FRAME': {
        //     await this.executeDataFrameService.execute({ workspaceId, mapId, nodeId });
        //     break;
        //   }
        //   case 'LLM': {
        //     const node = await this.executeLlmService.execute({ workspaceId, mapId, nodeId });
        //
        //     await this.distributionService.publish({
        //       type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
        //       payload: { mapId, nodes: { update: [node] } },
        //     });
        //     break;
        //   }
        //   case 'VISUALIZER': {
        //     const node = await this.executeVisualizerService.execute({ workspaceId, mapId, nodeId });
        //
        //     await this.distributionService.publish({
        //       type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
        //       payload: { mapId, nodes: { update: [node] } },
        //     });
        //     break;
        //   }
        // }
      } catch (e) {
        // console.error(ni.Tool.type + 'error', e);

        const nodes = await this.nodeRepository.clearProcessing({ workspaceId, mapId });

        await this.distributionService.publish({
          type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
          payload: { mapId, nodes: { update: nodes } },
        });

        break;
      }
    }
  }

  async deleteMap({ sub, mapId }: { sub: string; mapId: number }) {
    const user = await this.userRepository.getUserBySub({ sub });

    const shares = await this.shareRepository.getSharesOfMap({ mapId });

    for (const share of shares) {
      await this.distributionService.publish({
        type: SSE_EVENT_TYPE.INVALIDATE_SHARE,
        payload: { shareId: share.id },
      });
    }

    await this.shareRepository.deleteSharesOfMap({ mapId });

    const tab = await this.tabRepository.removeMapFromTab({ userId: user.id, mapId });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_TAB,
      payload: { tabId: tab.id },
    });

    await this.edgeRepository.deleteEdgesOfMap({ mapId });

    await this.nodeRepository.deleteNodesOfMap({ mapId });

    await this.mapRepository.deleteMap({ mapId });

    await this.workspaceRepository.removeMapFromWorkspaces({ mapId });

    await this.distributionService.publish({ type: SSE_EVENT_TYPE.INVALIDATE_WORKSPACE, payload: {} });
  }
}
