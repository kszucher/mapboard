import {
  DialogState,
  FormatMode,
  LeftMouseMode,
  MidMouseMode,
  Side
} from "../consts/Enums.ts"
import {M} from "../mapState/MapStateTypes.ts"

export interface EditorState {
  isLoading: boolean
  leftMouseMode: LeftMouseMode
  midMouseMode: MidMouseMode
  dialogState: DialogState
  formatMode: FormatMode
  mapId: string
  commitList: M[]
  commitIndex: number
  latestMapData: M
  latestMapMergeId: string
  editedNodeId: string
  editType: '' | 'append' | 'replace'
  editStartMapListIndex: number
  formatterVisible: boolean
  rOffsetCoords: number[]
  sMoveCoords: number[]
  insertLocation: {
    sl: string
    su: string
    sd: string
  }
  selectionRectCoords: number[]
  intersectingNodes: string[]
  zoomInfo: {
    fromX: number
    fromY: number
    scale: number
    prevMapX: number
    prevMapY: number
    translateX: number
    translateY: number
    originX: number
    originY: number
  }
  connectionHelpersVisible: boolean
  connectionStart: {
    fromNodeId: string,
    fromNodeSide: Side
  }
}
