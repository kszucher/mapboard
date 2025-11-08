import { useAuth0 } from '@auth0/auth0-react';
import { AlertDialog, Dialog, DropdownMenu, IconButton } from '@radix-ui/themes';
import { useDispatch } from 'react-redux';
import User from '../../../assets/user.svg?react';
import { api } from '../../data/api.ts';
import { actions } from '../../data/reducer.ts';
import { AlertDialogState, DialogState } from '../../data/state-types.ts';
import { AppDispatch } from '../../data/store.ts';

export const UserAccount = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { logout } = useAuth0();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="solid" color="gray">
          <User />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="bg-red-300" onCloseAutoFocus={e => e.preventDefault()}>
        <Dialog.Trigger>
          <DropdownMenu.Item onClick={() => dispatch(actions.setDialogState(DialogState.MAP_SHARES))}>
            {'Map Shares'}
          </DropdownMenu.Item>
        </Dialog.Trigger>

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          onClick={() => {
            logout({ logoutParams: { returnTo: window.location.origin } });
            dispatch(actions.resetState());
            dispatch(api.util.resetApiState());
          }}
        >
          {'Sign Out'}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            logout({ logoutParams: { returnTo: window.location.origin } });
            dispatch(api.endpoints.deleteWorkspace.initiate());
            dispatch(actions.resetState());
            dispatch(api.util.resetApiState());
          }}
        >
          {'Sign Out All Devices'}
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <AlertDialog.Trigger>
          <DropdownMenu.Item
            color="red"
            onClick={() => dispatch(actions.setAlertDialogState(AlertDialogState.DELETE_ACCOUNT))}
          >
            Delete Account
          </DropdownMenu.Item>
        </AlertDialog.Trigger>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
