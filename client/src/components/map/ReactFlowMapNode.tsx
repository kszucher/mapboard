import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge, Box, Flex, IconButton } from '@radix-ui/themes';
import type { Node as FlowNode } from '@xyflow/react';
import type { Node as BackendNode } from '../../../../shared/src/schema/schema.ts';
import Dots from '../../../assets/dots.svg?react';

export type AppFlowNode = FlowNode<BackendNode, 'custom'>;

export const CustomNode = ({ data }: NodeProps<AppFlowNode>) => {
  if (!data) return null;

  return (
    <div
      style={{
        position: 'relative',
        background: '#222222',
        color: '#fff',
        border: '1px solid #333',
        borderRadius: 8,
        padding: 12,
        minWidth: 150,
        minHeight: 80,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Top-left badges */}
      <Box position="absolute" top="8px" left="8px">
        <Flex direction="row" gap="4px" align="center">
          <Badge color="gray" size="2">
            {'N' + (data.iid || 1)}
          </Badge>
          <Badge color="blue" size="2">
            {data.iid || 'Node Label'}
          </Badge>
        </Flex>
      </Box>

      {/* Top-right dots button */}
      <Box position="absolute" top="8px" right="8px">
        <IconButton variant="soft" size="1" color="gray" style={{ background: 'none' }}>
          <Dots onClick={() => console.log('dots clicked')} />
        </IconButton>
      </Box>

      {/* Node body */}
      <div style={{ marginTop: 40 }}>
        <strong>{data.iid || 'Node Title'}</strong>
        <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>{data.iid || 'Description or body goes here'}</p>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
