import { Injectable } from '@nestjs/common';
import { SSE_EVENT_TYPE } from '../../../shared/src/api/api-types-distribution';
import { DistributionService } from '../distribution/distribution.service';
import { EdgeRepository } from './edge.repository';

@Injectable()
export class EdgeService {
  constructor(
    private edgeRepository: EdgeRepository,
    private distributionService: DistributionService,
  ) {
  }

  async insertEdge({ mapId, fromNodeId, toNodeId }: { mapId: number; fromNodeId: number; toNodeId: number }) {
    const edge = await this.edgeRepository.createEdge({
      mapId,
      fromNodeId,
      toNodeId,
    });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
      payload: { mapId, edges: { insert: [edge] } },
    });
  }

  async deleteEdge({ mapId, edgeId }: { mapId: number; edgeId: number }) {
    await this.edgeRepository.deleteEdge({ edgeId });

    await this.distributionService.publish({
      type: SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH,
      payload: { mapId, edges: { delete: [edgeId] } },
    });
  }
}
