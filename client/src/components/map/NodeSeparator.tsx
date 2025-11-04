import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getNodeLeft, getNodeTop, getNodeWidth } from '../../../../shared/src/map/map-getters.ts';
import { useGetToolInfoQuery } from '../../data/api.ts';
import { RootState } from '../../data/store.ts';
import { adjust } from '../../utils/utils.ts';
import { getLinearLinePath, pathCommonProps } from './UtilsSvg.ts';

export const NodeSeparator: FC = () => {
  const tools = useGetToolInfoQuery().data || [];
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);

  return m.n.map(ni => (
    <path
      key={`${ni.id}_separator`}
      d={getLinearLinePath({
        x1: adjust(getNodeLeft(ni)),
        x2: adjust(getNodeLeft(ni) + getNodeWidth(tools, ni)),
        y1: adjust(getNodeTop(ni) + 40),
        y2: adjust(getNodeTop(ni) + 40),
      })}
      stroke={'#444'}
      {...pathCommonProps}
    />
  ));
};
