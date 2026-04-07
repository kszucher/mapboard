import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {apiMutations} from "../apiMutations/ApiMutations.ts"
import {apiQueries} from "../apiQueries/ApiQueries.ts"
import {pythonBackendUrl} from "../urls/Urls.ts"

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: pythonBackendUrl,
  }),
  tagTypes: ['Workspace', 'LatestMerged'],
  endpoints: (builder) => ({...apiQueries(builder), ...apiMutations(builder)})
})

export const { useOpenWorkspaceQuery } = api
