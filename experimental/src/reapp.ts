import { Color } from '../../shared/src/schema/schema';

type NodeTypeKey = keyof typeof NodeType;

type EdgeTypeKey = `${NodeTypeKey}_TO_${NodeTypeKey}`;

type NodeTypeParams = {
  w: number;
  h: number;
  color: Color;
  label: string;
};

type EdgeTypeParams = {
  from: (typeof NodeType)[NodeTypeKey];
  to: (typeof NodeType)[NodeTypeKey];
};

type EdgeDefinition<T extends keyof typeof EdgeType> = {
  type: (typeof EdgeType)[T];
  from: (typeof EdgeType)[T]['from'];
  to: (typeof EdgeType)[T]['to'];
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

const nodes = {
  N5: { type: NodeType.FILE_UPLOAD },
  N1: { type: NodeType.CONTEXT },
  N8: { type: NodeType.QUESTION },
  N9: { type: NodeType.LLM },
  N4: { type: NodeType.DATA_FRAME },
  N6: { type: NodeType.LLM },
  N7: { type: NodeType.VISUALIZER },
} as const;

const edges = {
  E1: { type: EdgeType.FILE_UPLOAD_TO_DATA_FRAME, from: nodes.N5.type, to: nodes.N4.type },
  E2: { type: EdgeType.CONTEXT_TO_LLM, from: nodes.N1.type, to: nodes.N9.type },
  E3: { type: EdgeType.QUESTION_TO_LLM, from: nodes.N8.type, to: nodes.N7.type },
  E4: { type: EdgeType.QUESTION_TO_LLM, from: nodes.N8.type, to: nodes.N6.type },
  E5: { type: EdgeType.LLM_TO_DATA_FRAME, from: nodes.N9.type, to: nodes.N4.type },
  E6: { type: EdgeType.DATA_FRAME_TO_LLM, from: nodes.N4.type, to: nodes.N6.type },
  E7: { type: EdgeType.LLM_TO_VISUALIZER, from: nodes.N6.type, to: nodes.N7.type },
} as const satisfies Record<string, EdgeDefinition<keyof typeof EdgeType>>;

for (const node of Object.values(nodes)) {
}
