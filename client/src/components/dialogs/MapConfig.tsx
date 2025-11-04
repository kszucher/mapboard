import { Box, Button, Dialog, Flex, Tabs } from '@radix-ui/themes';
import { NodeTable } from '../tables/NodeTable.tsx';

export const MapConfig = () => {
  return (
    <Dialog.Content
      style={{
        animation: 'none',
        maxWidth: 800,
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <Dialog.Title>{'Config Tools'}</Dialog.Title>
      <Dialog.Description>{'Config tools'}</Dialog.Description>
      <Tabs.Root mt="4">
        <Box pt="3">
          <NodeTable />
        </Box>
      </Tabs.Root>
      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            {'Close'}
          </Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  );
};
