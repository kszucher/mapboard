import {
  DialogState,
  FormatMode,
  LeftMouseMode,
  MidMouseMode,
  Side
} from "../consts/Enums.ts"
import {EditorState} from "./EditorStateTypes.ts"

export const editorState: EditorState = {
  isLoading: false,
  leftMouseMode: LeftMouseMode.CLICK_SELECT,
  midMouseMode: MidMouseMode.SCROLL,
  dialogState: DialogState.NONE,
  formatMode: FormatMode.sFill,
  mapId: '',
  commitList: [],
  commitIndex: 0,
  latestMapData: [],
  latestMapMergeId: '',
  editedNodeId: '',
  editType: '',
  editStartMapListIndex: Infinity,
  formatterVisible: false,
  rOffsetCoords: [],
  sMoveCoords: [],
  insertLocation: {
    sl: '',
    su: '',
    sd: ''
  },
  selectionRectCoords: [],
  intersectingNodes: [],
  zoomInfo: {
    fromX: 0,
    fromY: 0,
    scale: 1,
    prevMapX: 0,
    prevMapY: 0,
    translateX: 0,
    translateY: 0,
    originX: 0,
    originY: 0,
  },
  connectionHelpersVisible: false,
  connectionStart: {
    fromNodeId: '',
    fromNodeSide: Side.R
  }
}

export const editorStateDefault = JSON.stringify(editorState)
