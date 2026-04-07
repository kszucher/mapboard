import {BaseQueryFn, EndpointBuilder} from "@reduxjs/toolkit/query"
import {
  DefaultGetLatestMergedQueryState,
  DefaultUseOpenWorkspaceQueryState
} from "../apiState/ApiStateTypes.ts"

export const apiQueries = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  openWorkspace: builder.query<DefaultUseOpenWorkspaceQueryState, void>({
    query: () => ({ url: 'open-workspace', method: 'POST' }),
    providesTags: ['Workspace']
  }),
  getLatestMerged: builder.query<DefaultGetLatestMergedQueryState, void>({
    query: () => ({ url: 'get-latest-merged', method: 'POST' }),
    providesTags: ['LatestMerged']
  })
})
