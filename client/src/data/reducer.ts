import { createSlice, current, isAction, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import {
  EdgeUpdateDown,
  NodeUpdateDown,
  UpdateMapGraphEventPayload,
} from '../../../shared/src/api/api-types-distribution.ts';
import { Edge, Node } from '../../../shared/src/schema/schema.ts';
import { api } from './api.ts';
import { state, stateDefault } from './state-defaults.ts';
import { AlertDialogState, DialogState, PageState } from './state-types.ts';

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
    setDialogState(state, action: PayloadAction<DialogState>) {
      state.dialogState = action.payload;
    },
    setAlertDialogState(state, action: PayloadAction<AlertDialogState>) {
      state.alertDialogState = action.payload;
    },
    undo(state) {
      state.commitIndex = state.commitIndex > 0 ? state.commitIndex - 1 : state.commitIndex;
    },
    redo(state) {
      state.commitIndex = state.commitIndex < state.commitList.length - 1 ? state.commitIndex + 1 : state.commitIndex;
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
