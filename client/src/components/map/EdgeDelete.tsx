import { IconButton } from '@radix-ui/themes';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLineCoords } from '../../../../shared/src/map/map-getters.ts';
import Trash from '../../../assets/trash.svg?react';
import { api, useGetMapInfoQuery, useGetNodeTypeInfoQuery } from '../../data/api.ts';
import { AppDispatch, RootState } from '../../data/store.ts';
import { getBezierLineCoords, getBezierLineCoordsMid } from './UtilsSvg.ts';

export const EdgeDelete: FC = () => {
  const nodeTypes = useGetNodeTypeInfoQuery().data || [];
  const mapId = useGetMapInfoQuery().data?.id!;
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);
  const edgeHelpersVisible = useSelector((state: RootState) => state.slice.edgeHelpersVisible);
  const dispatch = useDispatch<AppDispatch>();

  return (
    edgeHelpersVisible &&
    m.e.map(ei => (
      <IconButton
        key={`${ei.id}_inter_node_bezier_trash`}
        variant="solid"
        color="gray"
        size="1"
        radius="medium"
        style={{
          position: 'absolute',
          left: getBezierLineCoordsMid(getBezierLineCoords(getLineCoords(nodeTypes, m, ei))).x - 12,
          top: getBezierLineCoordsMid(getBezierLineCoords(getLineCoords(nodeTypes, m, ei))).y - 12,
          transition: 'all 0.3s',
          transitionTimingFunction: 'cubic-bezier(0.0,0.0,0.58,1.0)',
        }}
        onMouseDown={e => {
          e.stopPropagation();
        }}
        onClick={() => dispatch(api.endpoints.deleteEdge.initiate({ mapId, edgeId: ei.id }))}
      >
        <Trash />
      </IconButton>
    ))
  );
};
