// src/mastra/tools/download-csv-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const downloadCsvTool = createTool({
  id: 'download-csv',
  description: 'Downloads a CSV file from a URL.',
  inputSchema: z.object({
    url: z.string().url(),
  }),
  outputSchema: z.object({
    csv: z.string(),
  }),
  execute: async context => {
    const { url } = context.context;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.statusText}`);
    const csv = await res.text();
    return { csv };
  },
});


// url to csv
// csv to sql
// also query to sql
// etc., but not very motivating...
