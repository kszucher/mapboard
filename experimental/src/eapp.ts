import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const Nodes = [
  {
    id: 1,
    type: 'FILE_UPLOAD',
  },
  {
    id: 1,
    type: 'DATA_FRAME',
  },
];

const Edges = {
  fromNodeId: 1,
  toNodeId: 2,
  schema: z.object({}),
};

const step1 = createStep({
  id: 'FILE_UPLOAD',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  execute: async () => {
    console.log('Running step 1...');
    return { result: 'Step 1 complete' };
  },
});

const step2 = createStep({
  id: 'CONTEXT',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  execute: async () => {
    console.log('Running step 2...');
    return { result: 'Step 2 complete' };
  },
});

const step3 = createStep({
  id: 'QUESTION',
  inputSchema: z.object({}),
  outputSchema: z.object({ summary: z.string() }),
  execute: async input => {
    return { summary: 'Workflow complete' };
  },
});

const step4 = createStep({
  id: 'LLM_1',
  inputSchema: z.object({
    step1: z.object({ message: z.string() }),
    step5: z.object({ result: z.string() }),
  }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async input => {
    console.log('Running step 3...');
    console.log('Received input from previous steps:', input);
    return { summary: 'Workflow complete' };
  },
});

const step5 = createStep({
  id: 'DATA_FRAME',
  inputSchema: z.object({
    step1: z.object({ message: z.string() }),
    step5: z.object({ result: z.string() }),
  }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async input => {
    console.log('Running step 3...');
    console.log('Received input from previous steps:', input);
    return { summary: 'Workflow complete' };
  },
});

const step6 = createStep({
  id: 'LLM_2',
  inputSchema: z.object({
    step1: z.object({ message: z.string() }),
    step5: z.object({ result: z.string() }),
  }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async input => {
    console.log('Running step 3...');
    console.log('Received input from previous steps:', input);
    return { summary: 'Workflow complete' };
  },
});

const step7 = createStep({
  id: 'VISUALIZER',
  inputSchema: z.object({
    step1: z.object({ message: z.string() }),
    step5: z.object({ result: z.string() }),
  }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async input => {
    console.log('Running step 3...');
    console.log('Received input from previous steps:', input);
    return { summary: 'Workflow complete' };
  },
});

// Workflow definition
export const testWorkflow = createWorkflow({
  id: 'test-workflow',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
})
  .parallel([step1, step2, step3])
  // .then(step4)
  // .then(step5)
  // .then(step6)
  // .then(step7)
  .commit();

console.log(testWorkflow);
