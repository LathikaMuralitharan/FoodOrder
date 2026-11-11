import type { Plugin, ViteDevServer, PreviewServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleChat } from './bedrockService';

export function bedrockVitePlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const clientIp = req.socket?.remoteAddress || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
        const result = await handleChat({
          message: parsed.message,
          history: parsed.history,
          clientIp,
        });

        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.data));
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
  };

  return {
    name: 'vite-plugin-bedrock',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/v1/bedrock/chat', handler);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use('/api/v1/bedrock/chat', handler);
    },
  };
}
