import { useEffect, useCallback } from 'react';
import { ReactFlow, Controls, useNodesState, useEdgesState, addEdge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../data/store.ts';
import { CustomNode } from './ReactFlowMapnode.tsx';

const styles = {
  background: '#404040',
  width: '100%',
  height: 300,
};

const nodeTypes = { custom: CustomNode };

export const ReactFlowMap = () => {
  const m = useSelector((state: RootState) => state.slice.commitList[state.slice.commitIndex]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(params => setEdges(els => addEdge(params, els)), []);

  useEffect(() => {
    if (!m) return;

    const mappedNodes = m.n.map(n => ({
      id: n.id.toString(),
      type: 'custom',
      position: { x: n.offsetX || 0, y: n.offsetY || 0 },
      data: { label: `Tool ${n.toolId}`, ...n },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    const mappedEdges = m.e.map(e => ({
      id: e.id.toString(),
      source: e.fromNodeId.toString(),
      target: e.toNodeId.toString(),
      animated: false,
      style: {
        stroke: e.lineColor || '#ccc',
        strokeWidth: e.lineWidth || 1,
      },
    }));

    // 🚀 Apply new data to ReactFlow
    setNodes(mappedNodes);
    setEdges(mappedEdges);
  }, [m, setNodes, setEdges]);

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
      panOnScroll={true}
    >
      {/*<Background />*/}
      <Controls />
      {/*<MiniMap />*/}
    </ReactFlow>
  );
};

export default ReactFlowMap;
