import { FC } from 'react';
import { Logo } from './Logo.tsx';
import { MapConfig } from './MapConfig.tsx';
import { MapSelector } from './MapSelector.tsx';
import { NodeExecute } from './NodeExecute.tsx';
import { NodeInsert } from './NodeInsert.tsx';
import { NodeRedo } from './NodeRedo.tsx';
import { NodeUndo } from './NodeUndo.tsx';
import { UserAccount } from './UserAccount.tsx';

export const AppBar: FC = () => {
  return (
    <div className="dark:bg-zinc-800 bg-zinc-50 dark:border-neutral-700 fixed top-0 left-0 w-screen h-[40px] z-50">
      <Logo />
      <MapSelector />
      <div className="fixed flex right-1 gap-6 h-[40px]">
        <div className="flex items-center gap-1">
          <MapConfig />
          <NodeInsert />
          <NodeExecute />
        </div>
        <div className="flex flex-row items-center gap-1">
          <NodeUndo />
          <NodeRedo />
        </div>
        <div className="flex flex-row items-center gap-1">
          <UserAccount />
        </div>
      </div>
    </div>
  );
};
