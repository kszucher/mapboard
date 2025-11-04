import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getLineCoords, getOutputNodeOfEdge } from '../../../../shared/src/map/map-getters.ts';
import { useGetNodeTypeInfoQuery } from '../../data/api.ts';
import { RootState } from '../../data/store.ts';
import { getBezierLineCoords, getBezierLinePath, pathCommonProps } from './UtilsSvg.ts';

export const EdgeBezier: FC = () => {
  const nodeTypes = useGetNodeTypeInfoQuery().data || [];

  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);

  const dashLength = 6;
  const gapLength = 6;
  const dashCycle = dashLength + gapLength;

  if (!nodeTypes) {
    return null;
  }

  return m.e.map(ei => {
    const animated = getOutputNodeOfEdge(m, ei).isProcessing;

    const animationStyle = animated
      ? {
          strokeDasharray: `${dashLength}, ${gapLength}`,
          strokeDashoffset: 0,
          animation: `dashMove ${dashCycle / 12}s linear infinite`,
        }
      : {
          strokeDasharray: 'none',
          strokeDashoffset: 0,
          animation: 'none',
        };

    const mergedStyle = {
      ...(pathCommonProps.style || {}),
      ...animationStyle,
    };

    return (
      <g key={ei.id}>
        <style>{`@keyframes dashMove { to { stroke-dashoffset: -${dashCycle} } } `}</style>
        <path
          d={getBezierLinePath(getBezierLineCoords(getLineCoords(nodeTypes, m, ei)))}
          strokeWidth={1}
          stroke="#dddddd"
          fill="none"
          {...pathCommonProps}
          style={mergedStyle}
        />
      </g>
    );
  });
};
