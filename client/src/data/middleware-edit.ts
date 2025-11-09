import { isAnyOf, Middleware } from '@reduxjs/toolkit';

import { ShareAccess } from '../../../shared/src/schema/schema.ts';
import { api } from './api.ts';
import { actions } from './reducer.ts';
import { RootState } from './store.ts';

const blockedActions = isAnyOf(
  actions.undo,
  actions.redo,
  actions.updateNodeOptimistic,
  api.endpoints.renameMap.matchPending,
  api.endpoints.deleteMap.matchPending,
  api.endpoints.createShare.matchPending,
  api.endpoints.acceptShare.matchPending,
  api.endpoints.withdrawShare.matchPending,
  api.endpoints.rejectShare.matchPending,
  api.endpoints.modifyShareAccess.matchPending
);

export const blockWhenEditingMiddleware: Middleware<{}, RootState> = store => next => action => {
  const state = store.getState();

  if (blockedActions(action) && state.slice.mapShareAccess === ShareAccess.VIEW) {
    console.log('blocked in VIEW mode');
    return;
  }

  return next(action);
};
