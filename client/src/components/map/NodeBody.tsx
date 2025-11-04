import { Box, Flex, Text } from '@radix-ui/themes';
import React from 'react';

import { Node } from '../../../../shared/src/schema/schema.ts';

export const NodeBody = ({ nodeId, ni }: { nodeId: number; ni: Node }) => {
  console.log(nodeId, ni);
  return (
    <React.Fragment>
      <Box position="absolute" top="7" mt="2" ml="3" pt="2" pl="2" className="pointer-events-auto">
        <Flex direction="column" gap="2" align="start" content="center">
          <Text size="2">{`Attributes`}</Text>
        </Flex>
      </Box>
    </React.Fragment>
  );
};
