import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getMapHeight, getMapWidth } from '../../../../shared/src/map/map-getters.ts';
import { useGetToolInfoQuery } from '../../data/api.ts';
import { RootState } from '../../data/store.ts';

export const MapFrame: FC = () => {
  const tools = useGetToolInfoQuery().data || [];
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);
  const mapFrameVisible = useSelector((state: RootState) => state.slice.mapFrameVisible);

  return (
    mapFrameVisible && (
      <rect
        key={'svg_map_background'}
        x={0}
        y={0}
        width={getMapWidth(tools, m)}
        height={getMapHeight(tools, m)}
        rx={0}
        ry={0}
        fill={'none'}
        stroke={'#aaaaaa'}
        strokeWidth={0.5}
      />
    )
  );
};
