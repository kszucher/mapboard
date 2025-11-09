import type { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react';
import { Edge as BackendEdge, Node as BackendNode, Tool } from '../../../../shared/src/schema/schema.ts';

export type AppFlowNode = FlowNode<{ node: BackendNode; tool: Tool }, 'custom'>;
export type AppFlowEdge = FlowEdge<{ edge: BackendEdge }, 'custom'>;
