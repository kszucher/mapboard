import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { backendUrl } from '../urls/Urls.ts';
import { apiEdge } from './api-edge.ts';
import { apiMap } from './api-map.ts';
import { apiNodeType } from './api-node-type.ts';
import { apiNode } from './api-node.ts';
import { apiShare } from './api-share.ts';
import { apiTab } from './api-tab.ts';
import { apiUser } from './api-user.ts';
import { apiWorkspace } from './api-workspace.ts';
import { RootState } from './store.ts';

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: backendUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).slice.token;
      const workspaceId = (getState() as RootState).slice.workspaceId;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Workspace-Id', workspaceId.toString());
      }
      return headers;
    },
  }),
  tagTypes: ['UserInfo', 'MapInfo', 'NodeTypeInfo', 'TabInfo', 'ShareInfo'],
  endpoints: builder => ({
    ...apiUser(builder),
    ...apiMap(builder),
    ...apiNode(builder),
    ...apiNodeType(builder),
    ...apiEdge(builder),
    ...apiTab(builder),
    ...apiShare(builder),
    ...apiWorkspace(builder),
  }),
});

export const {
  useGetUserInfoQuery,
  useGetMapInfoQuery,
  useGetNodeTypeInfoQuery,
  useGetTabInfoQuery,
  useGetShareInfoQuery,
} = api;
