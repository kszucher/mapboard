import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DistributionController } from './distribution/distribution.controller';
import { DistributionService } from './distribution/distribution.service';
import { EdgeController } from './edge/edge.controller';
import { EdgeRepository } from './edge/edge.repository';
import { EdgeService } from './edge/edge.service';
import { MapController } from './map/map.controller';
import { MapRepository } from './map/map.repository';
import { MapService } from './map/map.service';
import { NodeController } from './node/node.controller';
import { NodeRepository } from './node/node.repository';
import { NodeService } from './node/node.service';
import { PrismaModule } from './prisma/prisma.module';
import { ShareController } from './share/share.controller';
import { ShareRepository } from './share/share.repository';
import { ShareService } from './share/share.service';
import { TabController } from './tab/tab.controller';
import { TabRepository } from './tab/tab.repository';
import { TabService } from './tab/tab.service';
import { ToolController } from './tool/tool.controller';
import { ToolRepository } from './tool/tool.repository';
import { ToolService } from './tool/tool.service';
import { UserController } from './user/user.controller';
import { UserRepository } from './user/user.repository';
import { UserService } from './user/user.service';
import { WorkspaceController } from './workspace/workspace.controller';
import { WorkspaceRepository } from './workspace/workspace.repository';
import { WorkspaceService } from './workspace/workspace.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [
    UserController,
    MapController,
    NodeController,
    ToolController,
    EdgeController,
    TabController,
    ShareController,
    WorkspaceController,
    DistributionController,
  ],
  providers: [
    UserRepository,
    MapRepository,
    NodeRepository,
    ToolRepository,
    EdgeRepository,
    TabRepository,
    ShareRepository,
    WorkspaceRepository,
    UserService,
    MapService,
    NodeService,
    ToolService,
    EdgeService,
    TabService,
    ShareService,
    WorkspaceService,
    DistributionService,
  ],

})

export class AppModule implements OnModuleInit {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly nodeService: NodeService,
    private readonly distributionService: DistributionService,
  ) {
  }

  async onModuleInit() {
    await this.workspaceService.deleteWorkspaces();
    await this.nodeService.clearProcessingAll();
    this.distributionService.connectAndSubscribe();
  }
}
