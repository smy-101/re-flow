import './load-env';

import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import * as z from 'zod/v4';
import { resolveMCPTokenCallerContext, MCPTokenAuthError } from '@/lib/auth/mcp-token';
import { getArticleCompositeViewById, listRecentArticleCompositeViews, MCPResourceNotFoundError } from '@/lib/mcp/read-service';
import type { CallerContext } from '@/lib/mcp';

const PORT = Number(process.env.MCP_PORT ?? 3333);
const HOST = process.env.MCP_HOST ?? '127.0.0.1';

type MCPRequest = IncomingMessage & {
  body?: unknown;
};

type MCPResponse = ServerResponse & {
  json: (body: unknown) => MCPResponse;
  send: (body: string) => MCPResponse;
  status: (code: number) => MCPResponse;
  headersSent: boolean;
};

interface SessionState {
  caller: CallerContext;
  server: McpServer;
  transport: StreamableHTTPServerTransport;
}

const sessions = new Map<string, SessionState>();

function getBearerToken(request: MCPRequest): string | null {
  const authorization = request.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length).trim();
}

async function authenticateRequest(request: MCPRequest, response: MCPResponse) {
  const bearerToken = getBearerToken(request);
  if (!bearerToken) {
    response.status(401).json({ error: 'Missing bearer token' });
    return null;
  }

  try {
    return await resolveMCPTokenCallerContext(bearerToken);
  } catch (error) {
    if (error instanceof MCPTokenAuthError) {
      response.status(error.status).json({ error: error.message, code: error.code });
      return null;
    }

    console.error('Unexpected MCP auth error:', error);
    response.status(500).json({ error: 'Authentication failed' });
    return null;
  }
}

function createRemoteRssMcpServer(caller: CallerContext) {
  const server = new McpServer({
    name: 'remote-rss-mcp-service',
    version: '1.0.0',
  });

  server.registerTool('list_recent_articles', {
    title: '最近文章列表',
    description: '返回 bearer token 授权范围内的最近文章组合视图，默认 20 条，最大 50 条。',
    inputSchema: {
      limit: z.number().int().min(1).optional(),
      feedIds: z.array(z.number().int().positive()).optional(),
      sinceUnix: z.number().int().positive().optional(),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
  }, async ({ limit, feedIds, sinceUnix }) => {
    const items = await listRecentArticleCompositeViews(caller, {
      limit,
      feedIds,
      sinceUnix,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(items, null, 2) }],
      structuredContent: {
        items,
        count: items.length,
      },
    };
  });

  server.registerTool('get_article_detail', {
    title: '单篇文章详情',
    description: '返回指定文章 ID 的组合视图详情。',
    inputSchema: {
      itemId: z.number().int().positive(),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
    },
  }, async ({ itemId }) => {
    try {
      const item = await getArticleCompositeViewById(caller, itemId);
      return {
        content: [{ type: 'text', text: JSON.stringify(item, null, 2) }],
        structuredContent: { ...item },
      };
    } catch (error) {
      if (error instanceof MCPResourceNotFoundError || error instanceof Error) {
        return {
          isError: true,
          content: [{ type: 'text', text: error.message }],
        };
      }

      return {
        isError: true,
        content: [{ type: 'text', text: 'Unknown MCP error' }],
      };
    }
  });

  return server;
}

const app = createMcpExpressApp({ host: HOST });

app.post('/mcp', async (request: MCPRequest, response: MCPResponse) => {
  const caller = await authenticateRequest(request, response);
  if (!caller) {
    return;
  }

  try {
    const sessionId = request.headers['mcp-session-id'];
    if (typeof sessionId === 'string' && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      if (session.caller.tokenId !== caller.tokenId) {
        response.status(403).json({ error: 'Session token mismatch' });
        return;
      }

      await session.transport.handleRequest(request, response, request.body);
      return;
    }

    if (!isInitializeRequest(request.body)) {
      response.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    const server = createRemoteRssMcpServer(caller);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        sessions.set(newSessionId, {
          caller,
          server,
          transport,
        });
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        sessions.delete(transport.sessionId);
      }
      void server.close();
    };

    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
  } catch (error) {
    console.error('Error handling MCP POST request:', error);
    if (!response.headersSent) {
      response.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (request: MCPRequest, response: MCPResponse) => {
  const caller = await authenticateRequest(request, response);
  if (!caller) {
    return;
  }

  const sessionId = request.headers['mcp-session-id'];
  if (typeof sessionId !== 'string' || !sessions.has(sessionId)) {
    response.status(400).send('Invalid or missing session ID');
    return;
  }

  const session = sessions.get(sessionId)!;
  if (session.caller.tokenId !== caller.tokenId) {
    response.status(403).send('Session token mismatch');
    return;
  }

  await session.transport.handleRequest(request, response);
});

const httpServer = createServer(app);

httpServer.listen(PORT, HOST, () => {
  console.log(`Remote RSS MCP service listening on http://${HOST}:${PORT}/mcp`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down remote MCP service...`);
  for (const session of sessions.values()) {
    await session.transport.close();
    await session.server.close();
  }
  sessions.clear();
  httpServer.close(() => process.exit(0));
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
