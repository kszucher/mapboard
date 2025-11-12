import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { createClient } from 'redis';
import { SSE_EVENT, SSE_EVENT_TYPE } from '../../../shared/src/api/api-types-distribution';
import { WorkspaceRepository } from '../workspace/workspace.repository';

@Injectable()
export class DistributionService {
  private publisher?: any;
  private subscriber?: any;
  private clients = new Map<string, { res: Response }>();
  private readonly channel = 'workspace_updates';

  constructor(private workspaceRepository: WorkspaceRepository) {
  }

  async connectAndSubscribe() {
    this.publisher = createClient({ url: process.env.REDIS_MAIN! });
    this.subscriber = this.publisher.duplicate();

    await this.publisher.connect();
    await this.subscriber.connect();

    await this.subscriber.subscribe(this.channel, (message: string) => {
      try {
        const event: SSE_EVENT = JSON.parse(message);
        this.broadcast(event);
      } catch (err) {
        console.error('Failed to parse Redis message:', err);
      }
    });
  }

  async publish(message: SSE_EVENT) {
    await this.publisher.publish(this.channel, JSON.stringify(message));
  }

  addClient(req: Request, res: Response, workspaceId: number) {
    const clientId = workspaceId.toString();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders?.();

    // Initial heartbeat & retry interval
    res.write(':\n\n');
    res.write('retry: 5000\n\n');

    this.clients.set(clientId, { res });

    req.on('close', async () => {
      console.log('killing workspace ', workspaceId);
      await this.workspaceRepository.deleteWorkspace({ workspaceId });
      this.clients.delete(clientId);
    });
  }

  private async broadcast(event: SSE_EVENT) {
    let workspaces;

    switch (event.type) {
      case SSE_EVENT_TYPE.INVALIDATE_MAP: {
        workspaces = await this.workspaceRepository.getWorkspacesOfMap({ mapId: event.payload.mapId });
        break;
      }
      case SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH: {
        workspaces = await this.workspaceRepository.getWorkspacesOfMap({ mapId: event.payload.mapId });
        break;
      }
      case SSE_EVENT_TYPE.INVALIDATE_TAB: {
        workspaces = await this.workspaceRepository.getWorkspacesOfTab({ tabId: event.payload.tabId });
        break;
      }
      case SSE_EVENT_TYPE.INVALIDATE_SHARE: {
        workspaces = await this.workspaceRepository.getWorkspacesOfShare({ shareId: event.payload.shareId });
        break;
      }
      case SSE_EVENT_TYPE.INVALIDATE_WORKSPACE: {
        workspaces = await this.workspaceRepository.getWorkspacesWithNoMap();
        break;
      }
    }

    for (const workspace of workspaces) {
      const client = this.clients.get(workspace.id.toString());
      if (client) {
        const message = JSON.stringify(event);
        client.res.write(`data: ${message}\n\n`);
      }
    }
  }
}
