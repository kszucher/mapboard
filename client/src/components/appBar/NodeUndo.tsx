import { IconButton } from '@radix-ui/themes';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ShareAccess } from '../../../../shared/src/schema/schema.ts';
import ArrowBackUp from '../../assets/arrow-back-up.svg?react';
import { useGetMapInfoQuery, useGetShareInfoQuery } from '../../data/api.ts';
import { actions } from '../../data/reducer.ts';
import { AppDispatch, RootState } from '../../data/store.ts';

export const NodeUndo: FC = () => {
  const mapId = useGetMapInfoQuery().data?.id!;
  const commitIndex = useSelector((state: RootState) => state.slice.commitIndex);
  const sharesWithUser = useGetShareInfoQuery().data?.SharesWithMe;
  const access = sharesWithUser?.find(el => el.id === mapId)?.access || ShareAccess.EDIT;
  const undoDisabled = access !== ShareAccess.EDIT || commitIndex === 0;
  const dispatch = useDispatch<AppDispatch>();
  return (
    <IconButton variant="solid" color="gray" disabled={undoDisabled} onClick={() => dispatch(actions.undo())}>
      <ArrowBackUp />
    </IconButton>
  );
};
