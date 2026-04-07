import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { FluentSupportClient } from './api/client.js'
import { createClient } from './api/client.js'
import { resolveConfig } from './config/resolver.js'
import { resolveApiUrl } from './config/types.js'
import type { ToolDefinition } from './tools/_factory.js'
import { DYNAMIC_TOOL_COUNT, registerDynamicTools } from './tools/dynamic.js'
import { createAllTools } from './tools/index.js'

export type ToolsetMode = 'static' | 'dynamic'

export interface ServerContext {
	client: FluentSupportClient
	tools: ToolDefinition[]
	version: string
	configSource: string
}

export function resolveServerContext(): ServerContext {
	const config = resolveConfig()
	const resolved = resolveApiUrl(config)
	const client = createClient(resolved)
	const tools = createAllTools(client)
	const configSource = process.env.FLUENTSUPPORT_URL ? 'env' : 'file'

	return { client, tools, version: '1.0.0', configSource }
}

export function createServerFromContext(
	ctx: ServerContext,
	mode: ToolsetMode = 'static',
): McpServer {
	const server = new McpServer({
		name: 'fluent-support-mcp',
		version: ctx.version,
	})

	if (mode === 'dynamic') {
		registerDynamicTools(server, ctx.tools)
	} else {
		for (const tool of ctx.tools) {
			server.registerTool(
				tool.name,
				{
					title: tool.title,
					description: tool.description,
					inputSchema: tool.schema,
					annotations: tool.annotations,
				},
				tool.handler,
			)
		}
	}

	const toolCount = mode === 'dynamic' ? DYNAMIC_TOOL_COUNT : ctx.tools.length
	console.error(
		`fluent-support-mcp v${ctx.version} started — ${toolCount} tools registered (${mode} mode)`,
	)
	console.error(`config source: ${ctx.configSource}`)

	return server
}

export function createServer(mode: ToolsetMode = 'static'): McpServer {
	return createServerFromContext(resolveServerContext(), mode)
}
