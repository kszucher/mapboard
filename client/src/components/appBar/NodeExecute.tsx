import { IconButton } from '@radix-ui/themes';
import { useDispatch, useSelector } from 'react-redux';
import { getTopologicalSort } from '../../../../shared/src/algorithms/topological-sort.ts';
import PlayerPlay from '../../../assets/player-play.svg?react';
import { api, useGetMapInfoQuery } from '../../data/api.ts';
import { AppDispatch, RootState } from '../../data/store.ts';

export const NodeExecute = () => {
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);
  const mapId = useGetMapInfoQuery().data?.id!!;
  const dispatch = useDispatch<AppDispatch>();

  return (
    <IconButton variant="solid" color="gray">
      <PlayerPlay
        onClick={() => {
          const topologicalSort = getTopologicalSort(m);
          if (!topologicalSort) {
            window.alert('circular dependency detected');
            return;
          }
          dispatch(api.endpoints.executeMap.initiate({ mapId }));
        }}
      />
    </IconButton>
  );
};
