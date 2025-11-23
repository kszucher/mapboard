import { DropdownMenu, IconButton } from '@radix-ui/themes';
import { useDispatch } from 'react-redux';
import Plus from '../../assets/plus.svg?react';
import { api, useGetMapInfoQuery, useGetToolInfoQuery } from '../../data/api.ts';
import { AppDispatch } from '../../data/store.ts';

export const NodeInsert = () => {
  const tools = useGetToolInfoQuery().data || [];
  const mapId = useGetMapInfoQuery().data?.id!;
  const dispatch = useDispatch<AppDispatch>();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="solid" color="gray">
          <Plus />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content onCloseAutoFocus={e => e.preventDefault()}>
        {tools.map(el => (
          <DropdownMenu.Item
            key={el.id}
            onClick={() => dispatch(api.endpoints.insertNode.initiate({ mapId, toolId: el.id! }))}
          >
            {el.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
