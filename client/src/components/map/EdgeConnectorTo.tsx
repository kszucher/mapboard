import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getNodeColor, getNodeLeft, getNodeTop } from '../../../../shared/src/map/map-getters.ts';
import { RootState } from '../../data/store.ts';
import { radixColorMap } from './UtilsSvg.ts';
import { useGetToolInfoQuery } from '../../data/api.ts';

export const EdgeConnectorTo: FC = () => {
  const tools = useGetToolInfoQuery().data || [];
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);

  return m.n.map(ni => {
    const isConnected = m.e.some(ei => ei.toNodeId === ni.id);
    const color = radixColorMap[getNodeColor(tools, ni)];
    return (
      <circle
        key={`${ni.id}_to`}
        r={3}
        fill={isConnected ? color : 'none'}
        stroke={color}
        strokeWidth={1.5}
        transform={`translate(${getNodeLeft(ni)}, ${getNodeTop(ni) + 60})`}
        vectorEffect="non-scaling-stroke"
        style={{
          transition: 'all 0.3s',
          transitionTimingFunction: 'cubic-bezier(0.0,0.0,0.58,1.0)',
          transitionProperty: 'all',
        }}
      />
    );
  });
};
