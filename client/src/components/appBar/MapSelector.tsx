import { Button, DropdownMenu, IconButton } from '@radix-ui/themes';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { ShareStatus } from '../../../../shared/src/schema/schema.ts';
import ChevronDown from '../../assets/chevron-down.svg?react';
import { api, useGetMapInfoQuery, useGetShareInfoQuery, useGetTabInfoQuery } from '../../data/api.ts';
import { AppDispatch } from '../../data/store.ts';
import { MapActions } from './MapActions.tsx';

export const MapSelector: FC = () => {
  const mapId = useGetMapInfoQuery().data?.id!;
  const mapName = useGetMapInfoQuery().data?.name;
  const tabMapInfo = useGetTabInfoQuery().data ?? [];
  const sharesWithUser = useGetShareInfoQuery().data?.SharesWithMe;
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className="fixed left-1/2 -translate-x-1/2 h-[40px] flex flex-row items-center gap-1 align-center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="soft" color="gray" radius="full">
            <ChevronDown />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenu.Label>{'My Maps'}</DropdownMenu.Label>
          {tabMapInfo?.map((el, index) => (
            <DropdownMenu.Item
              key={index}
              onClick={() => dispatch(api.endpoints.updateWorkspaceMap.initiate({ mapId: el.id }))}
            >
              {tabMapInfo[index].name}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator />
          <DropdownMenu.Label>{'Shared Maps'}</DropdownMenu.Label>
          {sharesWithUser
            ?.filter(el => el.status === ShareStatus.ACCEPTED)
            .map((el, index) => (
              <DropdownMenu.Item
                key={index}
                onClick={() => dispatch(api.endpoints.updateWorkspaceMap.initiate({ mapId: el.mapId }))}
              >
                {el.Map.name}
              </DropdownMenu.Item>
            ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Button
        variant="solid"
        radius="full"
        onClick={() => dispatch(api.endpoints.updateWorkspaceMap.initiate({ mapId }))}
      >
        {mapName}
      </Button>
      <MapActions />
    </div>
  );
};
