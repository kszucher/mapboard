import { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../data/store.ts';
import ReactFlowMap from './ReactFlowMap.tsx';

export const Map: FC = () => {
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);

  return (
    m && (
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlowMap />
      </div>
    )
  );
};
