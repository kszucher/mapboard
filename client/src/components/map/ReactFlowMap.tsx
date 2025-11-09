import {
  addEdge,
  type Connection,
  Controls,
  NodeTypes,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetToolInfoQuery } from '../../data/api.ts';
import { RootState } from '../../data/store.ts';
import { CustomNode } from './ReactFlowMapNode.tsx';
import { AppFlowEdge, AppFlowNode } from './types.ts';

const styles = {
  background: '#404040',
  width: '100%',
  height: 300,
};

const nodeTypes: NodeTypes = { custom: CustomNode };

export const ReactFlowMap = () => {
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);
  const tools = useGetToolInfoQuery().data;

  const [nodes, setNodes, onNodesChange] = useNodesState<AppFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppFlowEdge>([]);

  const onConnect = useCallback((params: Connection) => setEdges(els => addEdge(params, els)), []);

  useEffect(() => {
    if (!m || !tools) return;

    const mappedNodes: AppFlowNode[] = m.n.map(n => ({
      id: n.id.toString(),
      type: 'custom',
      position: { x: n.offsetX, y: n.offsetY },
      data: { node: n, tool: tools.find(el => el.id === n.toolId)! },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const mappedEdges: AppFlowEdge[] = m.e.map(e => ({
      id: e.id.toString(),
      source: e.fromNodeId.toString(),
      target: e.toNodeId.toString(),
      animated: false,
      style: {
        stroke: e.lineColor || '#ccc',
        strokeWidth: e.lineWidth || 1,
      },
    }));

    setNodes(mappedNodes);
    setEdges(mappedEdges);
  }, [m, tools, setNodes, setEdges]);

  if (!m) return null;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onConnect={onConnect}
      fitView
      style={styles}
      colorMode="dark"
      zoomOnScroll={false}
      panOnScroll
    >
      <Controls />
    </ReactFlow>
  );
};

export default ReactFlowMap;
