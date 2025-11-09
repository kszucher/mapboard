import type { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react';
import type { Edge as BackendEdge, Node as BackendNode } from '../../../../shared/src/schema/schema.ts';

export type AppFlowNode = FlowNode<BackendNode, 'custom'>;
export type AppFlowEdge = FlowEdge<BackendEdge, 'custom'>;
