import {
  addEdge,
  type Connection,
  Controls,
  NodeTypes,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { MouseEvent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api, useGetMapInfoQuery, useGetToolInfoQuery } from '../../data/api.ts';
import { AppDispatch, RootState } from '../../data/store.ts';
import { CustomNode } from './ReactFlowMapNode.tsx';
import { AppFlowEdge, AppFlowNode } from './types.ts';

const nodeTypes: NodeTypes = { custom: CustomNode };

const FlowContent = () => {
  const mapId = useGetMapInfoQuery().data?.id!;
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);
  const tools = useGetToolInfoQuery().data;

  const dispatch = useDispatch<AppDispatch>();

  const [nodes, setNodes, onNodesChange] = useNodesState<AppFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppFlowEdge>([]);

  const { fitView } = useReactFlow();

  const onConnect = useCallback((params: Connection) => setEdges(els => addEdge(params, els)), []);

  const centerAndFit = useCallback(() => {
    fitView({
      padding: 0.1,
      maxZoom: 1,
      duration: 300,
    }).then();
  }, [fitView]);

  const handleDoubleClick = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      centerAndFit();
    },
    [centerAndFit]
  );

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

    fitView({
      padding: 0.1,
      maxZoom: 1,
      duration: 0,
    }).then();
  }, [m, tools, setNodes, setEdges, fitView]);

  if (!m) return null;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onConnect={onConnect}
      onDoubleClick={handleDoubleClick}
      colorMode="dark"
      zoomOnScroll={false}
      zoomOnDoubleClick={false}
      panOnScroll
      onNodeDragStop={(_, node) =>
        dispatch(
          api.endpoints.moveNode.initiate({
            mapId,
            nodeId: Number(node.id),
            offsetX: Math.round(node.position.x),
            offsetY: Math.round(node.position.y),
          })
        )
      }
    >
      <Controls />
    </ReactFlow>
  );
};

export const ReactFlowMap = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
};

export default ReactFlowMap;
