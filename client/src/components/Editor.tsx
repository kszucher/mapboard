import { AlertDialog, Dialog, Spinner, Theme } from '@radix-ui/themes';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ColorMode } from '../../../shared/src/schema/schema.ts';
import { useGetMapInfoQuery, useGetUserInfoQuery } from '../data/api.ts';
import { actions } from '../data/reducer.ts';
import { AlertDialogState, DialogState } from '../data/state-types.ts';
import { AppDispatch, RootState } from '../data/store.ts';
import { UserAccountDelete } from './alertDialogs/UserAccountDelete.tsx';
import { AppBar } from './appBar/AppBar.tsx';
import { MapActionsRename } from './dialogs/MapActionsRename.tsx';
import { MapActionsShare } from './dialogs/MapActionsShare.tsx';
import { ToolConfig } from './dialogs/ToolConfig.tsx';
import { MapShares } from './dialogs/MapShares.tsx';
import ReactFlowMap from './map/ReactFlowMap.tsx';
import { Window } from './window/Window.tsx';

export const Editor: FC = () => {
  const isLoading = useSelector((state: RootState) => state.slice.isLoading);
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);
  const mapData = useGetMapInfoQuery().data?.data;
  const mExists = mapData && m && Object.keys(m).length;
  const colorMode = useGetUserInfoQuery().data?.userInfo.colorMode;
  const dialogState = useSelector((state: RootState) => state.slice.dialogState);
  const alertDialogState = useSelector((state: RootState) => state.slice.alertDialogState);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Theme
      appearance={colorMode === ColorMode.LIGHT ? 'light' : 'dark'}
      accentColor="iris"
      panelBackground="solid"
      scaling="100%"
      radius="full"
    >
      {mExists && (
        <Dialog.Root onOpenChange={isOpen => !isOpen && dispatch(actions.setDialogState(DialogState.NONE))}>
          <AlertDialog.Root
            onOpenChange={isOpen => !isOpen && dispatch(actions.setAlertDialogState(AlertDialogState.NONE))}
          >
            <ReactFlowMap />
            <AppBar />
            <Window />
            {alertDialogState === AlertDialogState.DELETE_ACCOUNT && <UserAccountDelete />}
          </AlertDialog.Root>
          {dialogState === DialogState.MAP_ACTIONS_RENAME && <MapActionsRename />}
          {dialogState === DialogState.MAP_ACTIONS_SHARE && <MapActionsShare />}
          {dialogState === DialogState.TOOL_CONFIG && <ToolConfig />}
          {dialogState === DialogState.MAP_SHARES && <MapShares />}
        </Dialog.Root>
      )}
      <div
        style={
          isLoading
            ? {
                opacity: 0.5,
                transition: 'opacity 0.3s ease-out',
                pointerEvents: 'auto',
              }
            : {
                opacity: 0,
                transition: 'opacity 0.3s ease-in',
                pointerEvents: 'none',
              }
        }
        className="fixed top-0 left-0 w-screen h-screen bg-zinc-900  flex items-center justify-center z-50"
      >
        <Spinner size="3" />
      </div>
    </Theme>
  );
};
