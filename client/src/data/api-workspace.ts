import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import {
  CreateWorkspaceResponseDto,
  UpdateWorkspaceMapRequestDto,
} from '../../../shared/src/api/api-types-workspace.ts';

export const apiWorkspace = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  createWorkspace: builder.mutation<CreateWorkspaceResponseDto, void>({
    query: () => ({
      url: 'create-workspace',
      method: 'POST',
    }),
    invalidatesTags: ['UserInfo', 'MapInfo', 'ToolInfo', 'TabInfo', 'ShareInfo'],
  }),

  updateWorkspaceMap: builder.mutation<void, UpdateWorkspaceMapRequestDto>({
    query: ({ mapId }) => ({
      url: 'update-workspace-map',
      method: 'POST',
      body: { mapId },
    }),
    invalidatesTags: ['MapInfo', 'TabInfo'],
  }),

  deleteWorkspace: builder.mutation<void, void>({
    query: () => ({
      url: 'delete-workspace',
      method: 'POST',
    }),
    invalidatesTags: [],
  }),
});
