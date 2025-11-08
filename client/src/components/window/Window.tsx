import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SSE_EVENT, SSE_EVENT_TYPE } from '../../../../shared/src/api/api-types-distribution.ts';
import { api } from '../../data/api.ts';
import { actions } from '../../data/reducer.ts';
import { AppDispatch, RootState } from '../../data/store.ts';
import { backendUrl } from '../../urls/Urls.ts';

export const Window: FC = () => {
  const workspaceId = useSelector((state: RootState) => state.slice.workspaceId);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (workspaceId) {
      console.log('attempt to start event source with workspaceId: ', workspaceId);
      const eventSource = new EventSource(`${backendUrl}/workspace_events/${workspaceId}`);

      eventSource.onopen = () => {
        console.log('SSE open');
      };

      eventSource.onerror = error => {
        console.error('SSE error', error);
      };

      eventSource.addEventListener('message', e => {
        const { type, payload } = JSON.parse(e.data) as SSE_EVENT;
        switch (type) {
          case SSE_EVENT_TYPE.INVALIDATE_MAP: {
            dispatch(api.util.invalidateTags(['MapInfo']));
            break;
          }
          case SSE_EVENT_TYPE.INVALIDATE_MAP_GRAPH: {
            dispatch(actions.updateMapGraphSse(payload));
            break;
          }
          case SSE_EVENT_TYPE.INVALIDATE_TAB: {
            dispatch(api.util.invalidateTags(['TabInfo']));
            break;
          }
          case SSE_EVENT_TYPE.INVALIDATE_SHARE: {
            dispatch(api.util.invalidateTags(['ShareInfo']));
            break;
          }
          case SSE_EVENT_TYPE.INVALIDATE_WORKSPACE: {
            dispatch(api.endpoints.createWorkspace.initiate());
            break;
          }
        }
      });

      return () => {
        console.log('SSE close');
        eventSource.close();
      };
    }
  }, [workspaceId]);

  return <></>;
};
