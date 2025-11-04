import { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import { CreateToolRequestDto, GetToolQueryResponseDto } from '../../../shared/src/api/api-types-tool.ts';

export const apiTool = (builder: EndpointBuilder<BaseQueryFn, string, string>) => ({
  getToolInfo: builder.query<GetToolQueryResponseDto, void>({
    query: () => ({ url: 'get-tool-info', method: 'POST', body: {} }),
    providesTags: ['ToolInfo'],
  }),

  createTool: builder.mutation<void, CreateToolRequestDto>({
    query: params => ({ url: 'create-tool', method: 'POST', body: params }),
    invalidatesTags: ['ToolInfo'],
  }),
});
