import {
  DefaultGetLatestMergedQueryState,
  DefaultUseOpenWorkspaceQueryState
} from "./ApiStateTypes.ts"

export const defaultUseOpenWorkspaceQueryState: DefaultUseOpenWorkspaceQueryState = {
  colorMode: 'dark',
  tabMapIdList: [],
  tabMapNameList: [],
  tabId: 0,
  breadcrumbMapIdList: [],
  breadcrumbMapNameList: [],
  mapId: '',
  mapName: '',
  mapData: {},
  mapMergeId: ''
}

export const defaultGetLatestMergedQueryState: DefaultGetLatestMergedQueryState = {
  mapData: {},
  mapMergeId: ''
}
