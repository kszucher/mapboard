export interface DefaultUseOpenWorkspaceQueryState {
  colorMode: string
  tabMapIdList: string[]
  tabMapNameList: string[]
  tabId: number
  breadcrumbMapIdList: string[]
  breadcrumbMapNameList: string[]
  mapId: string
  mapName: string
  mapData: object,
  mapMergeId: string,
}

export interface DefaultGetLatestMergedQueryState {
  mapData: object,
  mapMergeId: string,
}
