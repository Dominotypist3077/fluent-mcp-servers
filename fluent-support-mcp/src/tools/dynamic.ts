import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { ToolDefinition } from './_factory.js'

/**
 * Convert a Zod object schema to a JSON Schema representation.
 * Zod 3.x does not ship toJSONSchema — this utility covers the types used by our tools.
 */
function zodToJsonSchema(schema: z.ZodObject<z.ZodRawShape>): Record<string, unknown> {
	const shape = schema.shape
	const properties: Record<string, Record<string, unknown>> = {}
	const required: string[] = []

	for (const [key, zodType] of Object.entries(shape)) {
		const prop = describeZodType(zodType as z.ZodTypeAny)
		properties[key] = prop

		// A field is required unless it is optional
		if (!(zodType instanceof z.ZodOptional) && !(zodType instanceof z.ZodDefault)) {
			required.push(key)
		}
	}

	return {
		type: 'object',
		properties,
		...(required.length > 0 ? { required } : {}),
	}
}

function describeZodType(t: z.ZodTypeAny): Record<string, unknown> {
	// Unwrap wrappers first
	if (t instanceof z.ZodOptional) {
		return describeZodType(t.unwrap())
	}
	if (t instanceof z.ZodDefault) {
		const inner = describeZodType(t._def.innerType as z.ZodTypeAny)
		inner.default = t._def.defaultValue()
		return inner
	}

	const desc = t._def.description as string | undefined
	const base: Record<string, unknown> = {}
	if (desc) base.description = desc

	if (t instanceof z.ZodString) {
		return { ...base, type: 'string' }
	}
	if (t instanceof z.ZodNumber) {
		return { ...base, type: 'number' }
	}
	if (t instanceof z.ZodBoolean) {
		return { ...base, type: 'boolean' }
	}
	if (t instanceof z.ZodEnum) {
		return { ...base, type: 'string', enum: t._def.values }
	}
	if (t instanceof z.ZodArray) {
		return { ...base, type: 'array', items: describeZodType(t._def.type as z.ZodTypeAny) }
	}
	if (t instanceof z.ZodRecord) {
		return { ...base, type: 'object', additionalProperties: true }
	}
	if (t instanceof z.ZodObject) {
		return { ...base, ...zodToJsonSchema(t) }
	}
	if (t instanceof z.ZodUnknown) {
		return { ...base }
	}

	// Fallback
	return { ...base, type: 'string' }
}

const CATEGORIES = [
	'ticket',
	'customer',
	'agent',
	'report',
	'workflow',
	'saved_reply',
	'tag',
	'product',
	'activity',
	'setting',
] as const

type Category = (typeof CATEGORIES)[number]

function inferCategory(toolName: string): Category {
	const name = toolName.replace(/^fluentsupport_/, '')
	if (name.startsWith('ticket')) return 'ticket'
	if (name.startsWith('customer')) return 'customer'
	if (name.startsWith('agent')) return 'agent'
	if (name.startsWith('report')) return 'report'
	if (name.startsWith('workflow')) return 'workflow'
	if (name.startsWith('saved_reply')) return 'saved_reply'
	if (name.startsWith('tag')) return 'tag'
	if (name.startsWith('product')) return 'product'
	if (name.startsWith('activity')) return 'activity'
	if (name.startsWith('setting')) return 'setting'
	return 'ticket' // default
}

function matchScore(tool: ToolDefinition, query: string, category?: string): number {
	if (category && inferCategory(tool.name) !== category) return -1

	const q = query.toLowerCase()
	const words = q.split(/\s+/)
	const haystack = `${tool.name} ${tool.title} ${tool.description}`.toLowerCase()

	let score = 0
	for (const word of words) {
		if (haystack.includes(word)) score += 1
		if (tool.name.toLowerCase().includes(word)) score += 2
		if (tool.title.toLowerCase().includes(word)) score += 1
	}
	return score
}

/** Number of meta-tools registered in dynamic mode (search, describe, execute). */
export const DYNAMIC_TOOL_COUNT = 3

export function registerDynamicTools(server: McpServer, tools: ToolDefinition[]): void {
	const toolMap = new Map<string, ToolDefinition>()
	for (const tool of tools) {
		toolMap.set(tool.name, tool)
	}

	// 1. fluentsupport_search_tools
	server.registerTool(
		'fluentsupport_search_tools',
		{
			title: 'Search Fluent Support Tools',
			description:
				'Search available Fluent Support tools by keyword and optional category. Returns matching tool names, titles, and descriptions. Use this to discover which tools are available before calling them.',
			inputSchema: z.object({
				query: z
					.string()
					.describe('Search keyword(s) to match against tool names and descriptions'),
				category: z.enum(CATEGORIES).optional().describe('Filter by tool category'),
			}),
			annotations: {
				readOnlyHint: true,
				openWorldHint: false,
			},
		},
		async (input) => {
			const scored = tools
				.map((t) => ({ tool: t, score: matchScore(t, input.query, input.category) }))
				.filter((s) => s.score > 0)
				.sort((a, b) => b.score - a.score)
				.slice(0, 20)

			const results = scored.map((s) => ({
				name: s.tool.name,
				title: s.tool.title,
				description: s.tool.description,
				category: inferCategory(s.tool.name),
			}))

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify({
							total_available: tools.length,
							matches: results.length,
							tools: results,
						}),
					},
				],
			}
		},
	)

	// 2. fluentsupport_describe_tools
	server.registerTool(
		'fluentsupport_describe_tools',
		{
			title: 'Describe Fluent Support Tools',
			description:
				'Get full details (input schema, annotations) for specific tools by name. Use after search_tools to get the exact input parameters before executing a tool. Max 10 tools per request.',
			inputSchema: z.object({
				tools: z.array(z.string()).max(10).describe('Tool names to describe (max 10)'),
			}),
			annotations: {
				readOnlyHint: true,
				openWorldHint: false,
			},
		},
		async (input) => {
			const results = input.tools.map((name) => {
				const tool = toolMap.get(name)
				if (!tool) {
					return { name, error: 'Tool not found' }
				}
				return {
					name: tool.name,
					title: tool.title,
					description: tool.description,
					inputSchema: zodToJsonSchema(tool.schema),
					annotations: tool.annotations,
				}
			})

			return {
				content: [{ type: 'text' as const, text: JSON.stringify(results) }],
			}
		},
	)

	// 3. fluentsupport_execute_tool
	server.registerTool(
		'fluentsupport_execute_tool',
		{
			title: 'Execute Fluent Support Tool',
			description:
				'Execute a Fluent Support tool by name with the given input. Use describe_tools first to learn the required input schema.',
			inputSchema: z.object({
				tool_name: z.string().describe('Name of the tool to execute'),
				input: z
					.record(z.string(), z.unknown())
					.optional()
					.default({})
					.describe('Input parameters for the tool'),
			}),
			annotations: {
				openWorldHint: true,
			},
		},
		async (args) => {
			const tool = toolMap.get(args.tool_name)
			if (!tool) {
				return {
					content: [
						{
							type: 'text' as const,
							text: `Error: Tool "${args.tool_name}" not found. Use fluentsupport_search_tools to discover available tools.`,
						},
					],
					isError: true,
				}
			}

			const parsed = tool.schema.safeParse(args.input)
			if (!parsed.success) {
				return {
					content: [
						{
							type: 'text' as const,
							text: `Validation error: ${JSON.stringify(parsed.error.issues)}`,
						},
					],
					isError: true,
				}
			}

			return tool.handler(parsed.data as Record<string, unknown>)
		},
	)
}
