import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function agentTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_agent_list',
			title: 'List Agents',
			description:
				'List all support agents/staff members. Agents handle ticket responses and manage the helpdesk.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
				search: z.string().optional().describe('Search by agent name or email'),
			}),
			endpoint: '/settings/agents',
			cache: { key: 'agent_list', ttlMs: TTL.MEDIUM },
		}),

		getTool(client, {
			name: 'fluentsupport_agent_get',
			title: 'Get Agent',
			description:
				'Get detailed information about a specific agent including their stats and settings.',
			schema: z.object({
				agent_id: z.number().describe('Agent ID'),
			}),
			endpoint: '/settings/agents/:agent_id',
		}),

		postTool(client, {
			name: 'fluentsupport_agent_create',
			title: 'Create Agent',
			description:
				'Create a new support agent. The user_id must correspond to an existing WordPress user.',
			schema: z.object({
				user_id: z.number().describe('WordPress user ID to assign as agent (required)'),
				first_name: z.string().optional().describe('Agent first name'),
				last_name: z.string().optional().describe('Agent last name'),
				email: z.string().optional().describe('Agent email address'),
				title: z.string().optional().describe('Agent title/role label'),
			}),
			endpoint: '/settings/agents',
			invalidates: ['agent_list'],
		}),

		putTool(client, {
			name: 'fluentsupport_agent_update',
			title: 'Update Agent',
			description: 'Update agent profile information such as name, email, or title.',
			schema: z.object({
				agent_id: z.number().describe('Agent ID'),
				first_name: z.string().optional().describe('First name'),
				last_name: z.string().optional().describe('Last name'),
				email: z.string().optional().describe('Email address'),
				title: z.string().optional().describe('Agent title/role label'),
			}),
			endpoint: '/settings/agents/:agent_id',
			invalidates: ['agent_list'],
		}),

		deleteTool(client, {
			name: 'fluentsupport_agent_delete',
			title: 'Delete Agent',
			description:
				'Remove an agent from the support team. This does not delete the underlying WordPress user. Open tickets may need to be reassigned.',
			schema: z.object({
				agent_id: z.number().describe('Agent ID to delete'),
			}),
			endpoint: '/settings/agents/:agent_id',
			invalidates: ['agent_list'],
		}),
	]
}
