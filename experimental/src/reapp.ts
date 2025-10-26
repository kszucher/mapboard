import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { Color } from '../../shared/src/schema/schema';

type NodeTypeParams = {
  w: number;
  h: number;
  color: Color;
  label: string;
};

const NodeType = {
  CONTEXT: { w: 280, h: 240, color: Color.violet, label: 'Context' },
  DATA_FRAME: { w: 240, h: 240, color: Color.lime, label: 'Data Frame' },
  FILE_UPLOAD: { w: 280, h: 280, color: Color.jade, label: 'File Upload' },
  INGESTION: { w: 240, h: 280, color: Color.lime, label: 'Ingestion' },
  LLM: { w: 280, h: 240, color: Color.violet, label: 'LLM' },
  QUESTION: { w: 240, h: 160, color: Color.crimson, label: 'Question' },
  VECTOR_DATABASE: { w: 240, h: 100, color: Color.cyan, label: 'Vector Database' },
  VISUALIZER: { w: 240, h: 180, color: Color.yellow, label: 'Visualizer' },
} as const satisfies Record<Uppercase<string>, NodeTypeParams>;

type NodeTypeKey = keyof typeof NodeType;

type EdgeTypeParams = {
  from: (typeof NodeType)[NodeTypeKey];
  to: (typeof NodeType)[NodeTypeKey];
};

type EdgeTypeKey = `${NodeTypeKey}_TO_${NodeTypeKey}`;

const EdgeType = {
  CONTEXT_TO_LLM: { from: NodeType.CONTEXT, to: NodeType.LLM },
  DATA_FRAME_TO_LLM: { from: NodeType.DATA_FRAME, to: NodeType.LLM },
  FILE_UPLOAD_TO_DATA_FRAME: { from: NodeType.FILE_UPLOAD, to: NodeType.DATA_FRAME },
  FILE_UPLOAD_TO_INGESTION: { from: NodeType.FILE_UPLOAD, to: NodeType.INGESTION },
  INGESTION_TO_VECTOR_DATABASE: { from: NodeType.INGESTION, to: NodeType.VECTOR_DATABASE },
  LLM_TO_DATA_FRAME: { from: NodeType.LLM, to: NodeType.DATA_FRAME },
  LLM_TO_VISUALIZER: { from: NodeType.LLM, to: NodeType.VISUALIZER },
  LLM_TO_VECTOR_DATABASE: { from: NodeType.LLM, to: NodeType.VECTOR_DATABASE },
  LLM_TO_LLM: { from: NodeType.LLM, to: NodeType.LLM },
  QUESTION_TO_LLM: { from: NodeType.QUESTION, to: NodeType.LLM },
  VECTOR_DATABASE_TO_LLM: { from: NodeType.VECTOR_DATABASE, to: NodeType.LLM },
  VISUALIZER_TO_LLM: { from: NodeType.VISUALIZER, to: NodeType.LLM },
} as const satisfies Partial<Record<EdgeTypeKey, EdgeTypeParams>>;

type EdgeSchemaParams = {
  schema: z.ZodSchema;
};

const EdgeSchemas = {
  CONTEXT_TO_LLM: { schema: z.object({}) },
  DATA_FRAME_TO_LLM: { schema: z.object({}) },
  FILE_UPLOAD_TO_DATA_FRAME: { schema: z.object({}) },
  FILE_UPLOAD_TO_INGESTION: { schema: z.object({}) },
  INGESTION_TO_VECTOR_DATABASE: { schema: z.object({}) },
  LLM_TO_DATA_FRAME: {
    schema: z.object({
      columns: z.array(z.string()), // required
      filterColumn: z.string().optional(),
      filterOperator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'contains', 'in']).optional(),
      filterValue: z.any().optional(),
      groupBy: z.array(z.string()).optional(),
      aggregationColumn: z.string().optional(),
      aggregationOperation: z.enum(['sum', 'mean', 'count', 'min', 'max']).optional(),
      sortColumn: z.string().optional(),
      sortDirection: z.enum(['asc', 'desc']).optional(),
      limit: z.number().optional(),
      text: z.string(), // must be included by mastra
    }),
  },
  LLM_TO_VISUALIZER: { schema: z.object({}) },
  LLM_TO_VECTOR_DATABASE: { schema: z.object({}) },
  LLM_TO_LLM: { schema: z.object({}) },
  QUESTION_TO_LLM: { schema: z.object({}) },
  VECTOR_DATABASE_TO_LLM: { schema: z.object({}) },
  VISUALIZER_TO_LLM: { schema: z.object({}) },
} as const satisfies Partial<Record<EdgeTypeKey, EdgeSchemaParams>>;

const nodes = {
  N5: { type: NodeType.FILE_UPLOAD },
  N1: { type: NodeType.CONTEXT },
  N8: { type: NodeType.QUESTION },
  N9: { type: NodeType.LLM },
  N4: { type: NodeType.DATA_FRAME },
  N6: { type: NodeType.LLM },
  N7: { type: NodeType.VISUALIZER },
} as const;

type Node = (typeof nodes)[keyof typeof nodes];

type EdgeDefinition<T extends keyof typeof EdgeType> = {
  type: (typeof EdgeType)[T];
  from: (typeof EdgeType)[T]['from'];
  to: (typeof EdgeType)[T]['to'];
};

const edges = {
  E1: { type: EdgeType.FILE_UPLOAD_TO_DATA_FRAME, from: nodes.N5.type, to: nodes.N4.type },
  E2: { type: EdgeType.CONTEXT_TO_LLM, from: nodes.N1.type, to: nodes.N9.type },
  E3: { type: EdgeType.QUESTION_TO_LLM, from: nodes.N8.type, to: nodes.N7.type },
  E4: { type: EdgeType.QUESTION_TO_LLM, from: nodes.N8.type, to: nodes.N6.type },
  E5: { type: EdgeType.LLM_TO_DATA_FRAME, from: nodes.N9.type, to: nodes.N4.type },
  E6: { type: EdgeType.DATA_FRAME_TO_LLM, from: nodes.N4.type, to: nodes.N6.type },
  E7: { type: EdgeType.LLM_TO_VISUALIZER, from: nodes.N6.type, to: nodes.N7.type },
} as const satisfies Record<string, EdgeDefinition<keyof typeof EdgeType>>;

type Edge = (typeof nodes)[keyof typeof nodes];

// TODO use graphology/graphology-dag for topological sort and graph traversal (in nodes, out nodes, etc.)

const steps = [];

const getInputNodesOfNode = (node: Node): Node[] => {
  return Object.values(edges)
    .filter(edge => edge.to === node.type)
    .map(edge => {
      return Object.values(nodes).find(n => n.type === edge.from)!;
    });
};

for (const node of Object.values(nodes)) {
  steps.push(
    createStep({
      id: node.type.label,
      inputSchema: z.object({}),
      outputSchema: z.object({ result: z.string() }),
      execute: async () => {
        switch (node.type) {
          case NodeType.CONTEXT: {
            return { result: 'Step complete' };
          }
          case NodeType.DATA_FRAME: {
            return { result: 'Step complete' };
          }
          case NodeType.FILE_UPLOAD: {
            return { result: 'Step complete' };
          }
          case NodeType.LLM: {
            return { result: 'Step complete' };
          }
          case NodeType.VISUALIZER: {
            return { result: 'Step complete' };
          }
          default: {
            return { result: 'Step Incomplete' };
          }
        }
      },
    })
  );
}
