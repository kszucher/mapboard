import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { Color } from '../../shared/src/schema/schema';

type NodeKey = keyof typeof Node;

type EdgeKey = `${NodeKey}_TO_${NodeKey}`;

type NodeType = {
  w: number;
  h: number;
  color: Color;
  label: string;
};

type EdgeType = {
  from: (typeof Node)[NodeKey];
  to: (typeof Node)[NodeKey];
};

const Node = {
  CONTEXT: { w: 280, h: 240, color: Color.violet, label: 'Context' },
  DATA_FRAME: { w: 240, h: 240, color: Color.lime, label: 'Data Frame' },
  FILE_UPLOAD: { w: 280, h: 280, color: Color.jade, label: 'File Upload' },
  INGESTION: { w: 240, h: 280, color: Color.lime, label: 'Ingestion' },
  LLM: { w: 280, h: 240, color: Color.violet, label: 'LLM' },
  QUESTION: { w: 240, h: 160, color: Color.crimson, label: 'Question' },
  VECTOR_DATABASE: { w: 240, h: 100, color: Color.cyan, label: 'Vector Database' },
  VISUALIZER: { w: 240, h: 180, color: Color.yellow, label: 'Visualizer' },
} satisfies Record<string, NodeType>;

const Edge = {
  CONTEXT_TO_LLM: { from: Node.CONTEXT, to: Node.LLM },
  DATA_FRAME_TO_LLM: { from: Node.DATA_FRAME, to: Node.LLM },
  FILE_UPLOAD_TO_DATA_FRAME: { from: Node.FILE_UPLOAD, to: Node.DATA_FRAME },
  FILE_UPLOAD_TO_INGESTION: { from: Node.FILE_UPLOAD, to: Node.INGESTION },
  INGESTION_TO_VECTOR_DATABASE: { from: Node.INGESTION, to: Node.VECTOR_DATABASE },
  LLM_TO_DATA_FRAME: { from: Node.LLM, to: Node.DATA_FRAME },
  LLM_TO_VISUALIZER: { from: Node.LLM, to: Node.VISUALIZER },
  LLM_TO_VECTOR_DATABASE: { from: Node.LLM, to: Node.VECTOR_DATABASE },
  LLM_TO_LLM: { from: Node.LLM, to: Node.LLM },
  QUESTION_TO_LLM: { from: Node.QUESTION, to: Node.LLM },
  VECTOR_DATABASE_TO_LLM: { from: Node.VECTOR_DATABASE, to: Node.LLM },
  VISUALIZER_TO_LLM: { from: Node.VISUALIZER, to: Node.LLM },
} satisfies Partial<Record<EdgeKey, EdgeType>>;

const graph = {
  Nodes: {
    N5: Node.CONTEXT,
  },
  Edges: {},
};

// TODO: actually create node types and edge types, and GET their id-s, so there will be a mapping in between
// the generated flow and the actual UI stuff

const steps = [];

// TODO apply topological sort from a library...

// for (const nodeId of topologicalSort) {
//   const ni = nodesForSorting.find(ni => ni.id === nodeId)!;
//
//   steps.push(
//     createStep({
//       id: ni.NodeType.label,
//       inputSchema: z.object({}),
//       outputSchema: z.object({ result: z.string() }),
//       execute: async () => {
//         switch (ni.NodeType.label) {
//           case 'Context': {
//             break;
//           }
//           case 'Data Frame': {
//             break;
//           }
//           case 'File Upload': {
//             break;
//           }
//           case 'Ingestion': {
//             break;
//           }
//           case 'LLM': {
//             break;
//           }
//           case 'Question': {
//             break;
//           }
//           case 'Vector Database': {
//             break;
//           }
//           case 'Visualizer': {
//             break;
//           }
//         }
//
//         console.log('Running step 1...');
//         return { result: 'Step 1 complete' };
//       },
//     })
//   );
// }
