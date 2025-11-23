import { Dialog, DropdownMenu, IconButton } from '@radix-ui/themes';
import { useDispatch } from 'react-redux';
import TriangleSquareCircle from '../../assets/triangle-square-circle.svg?react';
import { actions } from '../../data/reducer.ts';
import { DialogState } from '../../data/state-types.ts';
import { AppDispatch } from '../../data/store.ts';

export const ToolConfig = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton color="gray" radius="full">
          <TriangleSquareCircle />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
        <Dialog.Trigger>
          <DropdownMenu.Item onClick={() => dispatch(actions.setDialogState(DialogState.TOOL_CONFIG))}>
            {'Config Tools'}
          </DropdownMenu.Item>
        </Dialog.Trigger>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
//