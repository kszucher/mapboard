export const nodeBackendUrl = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8082'
  : 'https://mapboard-server.onrender.com'

export const pythonBackendUrl = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8083'
  : 'https://mapboard-llm-server.onrender.com'
