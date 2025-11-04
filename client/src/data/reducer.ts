import { createSlice, current, isAction, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import {
  EdgeUpdateDown,
  NodeUpdateDown,
  UpdateMapGraphEventPayload,
} from '../../../shared/src/api/api-types-distribution.ts';
import { getNodeHeight, getNodeWidth } from '../../../shared/src/map/map-getters.ts';
import { alignNodes } from '../../../shared/src/map/map-setters.ts';
import { Edge, Node, Tool } from '../../../shared/src/schema/schema.ts';
import { getMapX, getMapY } from '../components/map/UtilsDiv.ts';
import { api } from './api.ts';
import { state, stateDefault } from './state-defaults.ts';
import { AlertDialogState, DialogState, MidMouseMode, PageState, State } from './state-types.ts';

export const slice = createSlice({
  name: 'slice',
  initialState: state,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    resetState() {
      return JSON.parse(stateDefault);
    },
    setMidMouseMode(state, action: PayloadAction<MidMouseMode>) {
      state.midMouseMode = action.payload;
    },
    setDialogState(state, action: PayloadAction<DialogState>) {
      state.dialogState = action.payload;
    },
    setAlertDialogState(state, action: PayloadAction<AlertDialogState>) {
      state.alertDialogState = action.payload;
    },
    setZoomInfo(state, action: PayloadAction<Omit<State['zoomInfo'], 'fromX' | 'fromY'>>) {
      state.zoomInfo.scale = action.payload.scale;
      state.zoomInfo.prevMapX = action.payload.prevMapX;
      state.zoomInfo.prevMapY = action.payload.prevMapY;
      state.zoomInfo.translateX = action.payload.translateX;
      state.zoomInfo.translateY = action.payload.translateY;
      state.zoomInfo.originX = action.payload.originX;
      state.zoomInfo.originY = action.payload.originY;
    },
    setEdgeHelpersVisible(state, { payload }: PayloadAction<boolean>) {
      state.edgeHelpersVisible = payload;
    },
    setRootFrameVisible(state, { payload }: PayloadAction<boolean>) {
      state.mapFrameVisible = payload;
    },
    clearConnectionStart(state) {
      state.connectionStart = { fromNodeId: null };
    },
    undo(state) {
      state.commitIndex = state.commitIndex > 0 ? state.commitIndex - 1 : state.commitIndex;
    },
    redo(state) {
      state.commitIndex = state.commitIndex < state.commitList.length - 1 ? state.commitIndex + 1 : state.commitIndex;
    },
    saveView(state, action: PayloadAction<{ e: React.WheelEvent }>) {
      const { e } = action.payload;
      const { scale, prevMapX, prevMapY, originX, originY } = state.zoomInfo;
      const mapX = getMapX(e);
      const mapY = getMapY(e);
      const x = originX + (mapX - prevMapX) / scale;
      const y = originY + (mapY - prevMapY) / scale;
      const ZOOM_INTENSITY = 0.2;
      let newScale = scale * Math.exp((e.deltaY < 0 ? 1 : -1) * ZOOM_INTENSITY);
      if (newScale > 20) {
        newScale = 20;
      }
      if (newScale < 0.2) {
        newScale = 0.2;
      }
      state.zoomInfo.scale = newScale;
      state.zoomInfo.prevMapX = mapX;
      state.zoomInfo.prevMapY = mapY;
      state.zoomInfo.translateX = (mapX - x) / newScale;
      state.zoomInfo.translateY = (mapY - y) / newScale;
      state.zoomInfo.originX = x;
      state.zoomInfo.originY = y;
    },
    moveNodePreviewStart(state, action: PayloadAction<{ e: React.MouseEvent }>) {
      const { e } = action.payload;
      const { scale, prevMapX, prevMapY, originX, originY } = state.zoomInfo;
      state.zoomInfo.fromX = originX + (getMapX(e) - prevMapX) / scale;
      state.zoomInfo.fromY = originY + (getMapY(e) - prevMapY) / scale;
    },
    moveNodePreviewUpdate(state, action: PayloadAction<{ tools: Partial<Tool>[]; n: Node; e: MouseEvent }>) {
      const { tools, n, e } = action.payload;
      const { fromX, fromY, scale, prevMapX, prevMapY, originX, originY } = state.zoomInfo;
      const toX = originX + (getMapX(e) - prevMapX) / scale - fromX + n.offsetX;
      const toY = originY + (getMapY(e) - prevMapY) / scale - fromY + n.offsetY;
      state.nodeOffsetCoords = [toX, toY, getNodeWidth(tools, n), getNodeHeight(tools, n)];
    },
    moveNodePreviewEnd(state) {
      state.nodeOffsetCoords = [];
    },
    moveNodeOptimistic(
      state,
      {
        payload: { nodeId, offsetX, offsetY },
      }: PayloadAction<{
        nodeId: number;
        offsetX: number;
        offsetY: number;
      }>
    ) {
      const m = structuredClone(current(state.commitList[state.commitIndex]));
      const newM = {
        n: m.n.map(ni => (ni.id === nodeId ? { ...ni, offsetX, offsetY, updatedAt: new Date() } : ni)),
        e: m.e,
      };
      alignNodes(newM);
      state.commitList = [...state.commitList.slice(0, state.commitIndex), newM];
    },
    updateNodeOptimistic(state, { payload: { node } }: PayloadAction<{ node: Partial<Node> }>) {
      const m = structuredClone(current(state.commitList[state.commitIndex]));
      const newM = {
        n: m.n.map(ni => (ni.id === node.id ? { ...ni, ...node, updatedAt: new Date() } : ni)),
        e: m.e,
      };
      state.commitList = [...state.commitList.slice(0, state.commitIndex), newM];
    },
    updateMapGraphSse(state, { payload: { nodes, edges } }: PayloadAction<UpdateMapGraphEventPayload>) {
      const m = structuredClone(current(state.commitList[state.commitIndex]));
      const { insert: nodeInsert = [], update: nodeUpdate = [], delete: nodeDelete = [] } = nodes ?? {};
      const { insert: edgeInsert = [], update: edgeUpdate = [], delete: edgeDelete = [] } = edges ?? {};
      const allowedNodeUpdate = (s: NodeUpdateDown, c: Node) =>
        c.workspaceId === s.workspaceId ? s.updatedAt > c.updatedAt : true;
      const allowedEdgeUpdate = (s: EdgeUpdateDown, c: Edge) =>
        c.workspaceId === s.workspaceId ? s.updatedAt > c.updatedAt : true;
      const newM = {
        n: [
          ...m.n
            .filter(ni => !nodeDelete.includes(ni.id))
            .map(ni =>
              nodeUpdate.some(nj => nj.id === ni.id && allowedNodeUpdate(nj, ni))
                ? { ...ni, ...nodeUpdate.find(nj => nj.id === ni.id && allowedNodeUpdate(nj, ni)) }
                : ni
            ),
          ...nodeInsert,
        ],
        e: [
          ...m.e
            .filter(ei => !edgeDelete.includes(ei.id))
            .map(ei =>
              edgeUpdate.some(ej => ej.id === ei.id && allowedEdgeUpdate(ej, ei))
                ? { ...ei, ...edgeUpdate.find(ej => ej.id === ei.id && allowedEdgeUpdate(ej, ei)) }
                : ei
            ),
          ...edgeInsert,
        ],
      };

      state.commitList = [...state.commitList.slice(0, state.commitIndex), newM];
    },
  },
  extraReducers: builder => {
    builder.addMatcher(isAction, () => {});
    builder.addMatcher(api.endpoints.createWorkspace.matchFulfilled, (state, { payload }) => {
      state.workspaceId = payload.workspaceId;
      state.pageState = PageState.WS;
    });
    builder.addMatcher(
      isAnyOf(
        api.endpoints.toggleColorMode.matchPending,
        api.endpoints.createMapInTab.matchPending,
        api.endpoints.createMapInTabDuplicate.matchPending,
        api.endpoints.updateWorkspaceMap.matchPending,
        api.endpoints.renameMap.matchPending,
        api.endpoints.moveUpMapInTab.matchPending,
        api.endpoints.moveDownMapInTab.matchPending,
        api.endpoints.deleteMap.matchPending,
        api.endpoints.createShare.matchPending,
        api.endpoints.acceptShare.matchPending,
        api.endpoints.withdrawShare.matchPending,
        api.endpoints.rejectShare.matchPending,
        api.endpoints.modifyShareAccess.matchPending,
        api.endpoints.deleteAccount.matchPending
      ),
      state => {
        state.isLoading = true;
      }
    );
    builder.addMatcher(api.endpoints.getMapInfo.matchFulfilled, (state, { payload }) => {
      console.log(payload);
      const isValid = true;
      if (isValid) {
        const m = structuredClone(payload.data);
        state.commitList = [m];
        state.commitIndex = 0;
        state.mapShareAccess = payload.shareAccess;
      } else {
        window.alert('invalid map');
      }
    });
    builder.addMatcher(
      isAnyOf(
        api.endpoints.getUserInfo.matchFulfilled,
        api.endpoints.getMapInfo.matchFulfilled,
        api.endpoints.getTabInfo.matchFulfilled,
        api.endpoints.getShareInfo.matchFulfilled
      ),
      state => {
        state.isLoading = false;
      }
    );
  },
});

export const { actions } = slice;
