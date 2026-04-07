import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function activityTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_activity_list',
			title: 'List Activities',
			description:
				'List recent activity log entries. Activities track all actions performed on tickets, customers, and agents (replies, status changes, assignments, etc.).',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
				ticket_id: z.number().optional().describe('Filter activities by ticket ID'),
				agent_id: z.number().optional().describe('Filter activities by agent ID'),
				type: z.string().optional().describe('Filter by activity type'),
			}),
			endpoint: '/activities',
		}),
	]
}
