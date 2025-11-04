import { M, ShareAccess } from '../../../shared/src/schema/schema.ts';

export interface State {
  token: string;
  workspaceId: number;
  isLoading: boolean;
  midMouseMode: MidMouseMode;
  pageState: PageState;
  dialogState: DialogState;
  alertDialogState: AlertDialogState;
  commitList: M[];
  commitIndex: number;
  mapShareAccess: ShareAccess;
  nodeOffsetCoords: number[];
  zoomInfo: {
    fromX: number;
    fromY: number;
    scale: number;
    prevMapX: number;
    prevMapY: number;
    translateX: number;
    translateY: number;
    originX: number;
    originY: number;
  };
  edgeHelpersVisible: boolean;
  mapFrameVisible: boolean;
  connectionStart: {
    fromNodeId: number | null;
  };
}

export enum PageState {
  AUTH,
  WS,
}

export const DialogState = {
  NONE: 'NONE',
  MAP_ACTIONS_SHARE: 'MAP_ACTIONS_SHARE',
  MAP_ACTIONS_RENAME: 'MAP_ACTIONS_RENAME',
  TOOL_CONFIG: 'TOOL_CONFIG',
  MAP_SHARES: 'MAP_SHARES',
};

export type DialogState = (typeof DialogState)[keyof typeof DialogState];

export enum AlertDialogState {
  NONE,
  DELETE_ACCOUNT,
}

export enum MidMouseMode {
  SCROLL = 'scroll',
  ZOOM = 'zoom',
}
