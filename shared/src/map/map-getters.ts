import { M_PADDING, N_PADDING } from '../consts/consts';
import { Color, Edge, Node, NodeType, M } from '../schema/schema';

export const getNodeType = (nodeTypes: Partial<NodeType>[], n: Node) => nodeTypes.find(nt => nt.id === n.nodeTypeId);

export const getNodeLabel = (nodeTypes: Partial<NodeType>[], n: Node) => getNodeType(nodeTypes, n)?.label || '';

export const getNodeColor = (nodeTypes: Partial<NodeType>[], n: Node) => getNodeType(nodeTypes, n)?.color || Color.gray;

export const getNodeLeft = (n: Node) => n.offsetX + M_PADDING;

export const getNodeTop = (n: Node) => n.offsetY + M_PADDING;

export const getNodeWidth = (nodeTypes: Partial<NodeType>[], n: Node) => getNodeType(nodeTypes, n)?.w || 0;

export const getNodeHeight = (nodeTypes: Partial<NodeType>[], n: Node) => getNodeType(nodeTypes, n)?.h || 0;

export const getNodeRight = (nodeTypes: Partial<NodeType>[], n: Node) => n.offsetX + getNodeWidth(nodeTypes, n) + N_PADDING;

export const getMapWidth = (nodeTypes: Partial<NodeType>[], m: M) => {
  const max = Math.max(...m.n.map(ni => ni.offsetX + getNodeWidth(nodeTypes, ni) + N_PADDING));
  return Number.isFinite(max) ? max + 2 * M_PADDING : 0;
};

export const getMapHeight = (nodeTypes: Partial<NodeType>[], m: M) => {
  const max = Math.max(...m.n.map(ni => ni.offsetY + getNodeHeight(nodeTypes, ni) + N_PADDING));
  return Number.isFinite(max) ? max + 2 * M_PADDING : 0;
};

export const isExistingEdge = (m: M, fromNodeId: number, toNodeId: number): boolean =>
  m.e.some(ei => ei.fromNodeId === fromNodeId && ei.toNodeId === toNodeId);

export const getInputNodeOfEdge = (m: M, e: Edge): Node => m.n.find(ni => ni.id === e.fromNodeId)!;

export const getOutputNodeOfEdge = (m: M, e: Edge): Node => m.n.find(ni => ni.id === e.toNodeId)!;

export const getLineCoords = (nodeTypes: Partial<NodeType>[], m: M, e: Edge) => {
  const fromNode = getInputNodeOfEdge(m, e);
  const toNode = getOutputNodeOfEdge(m, e);

  return [
    getNodeRight(nodeTypes, fromNode),
    getNodeTop(fromNode) + 60,
    getNodeLeft(toNode),
    getNodeTop(toNode) + 60,
  ];
};

// Kahn's algorithm
export const getTopologicalSort = (m: {
  n: Pick<Node, 'id'>[],
  e: Pick<Edge, 'fromNodeId' | 'toNodeId'>[]
}): number[] | null => {
  const { n, e } = m;
  const graph = new Map<number, Set<number>>();
  const inDegree = new Map<number, number>();

  // Initialize graph and indegree counts
  for (const node of n) {
    graph.set(node.id, new Set());
    inDegree.set(node.id, 0);
  }

  // Build graph edges and update indegree
  for (const edge of e) {
    const { fromNodeId: from, toNodeId: to } = edge;
    graph.get(from)!.add(to);
    inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
  }

  // Start with nodes that have no incoming edges
  const queue: number[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(nodeId);
  }

  const order: number[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    for (const neighbor of graph.get(current) ?? []) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If not all nodes were sorted, the graph has a cycle
  if (order.length !== n.length) {
    return null;
  }

  return order;
};
