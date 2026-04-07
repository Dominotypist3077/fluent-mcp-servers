import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function workflowTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_workflow_list',
			title: 'List Workflows',
			description:
				'List all automation workflows. Workflows automate ticket routing, auto-replies, SLA enforcement, and other support actions.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
				status: z
					.enum(['active', 'inactive'])
					.optional()
					.describe('Filter by workflow status'),
			}),
			endpoint: '/workflows',
		}),

		getTool(client, {
			name: 'fluentsupport_workflow_get',
			title: 'Get Workflow',
			description:
				'Get detailed information about a specific workflow including its triggers, conditions, and actions.',
			schema: z.object({
				workflow_id: z.number().describe('Workflow ID'),
			}),
			endpoint: '/workflows/:workflow_id',
		}),

		postTool(client, {
			name: 'fluentsupport_workflow_create',
			title: 'Create Workflow',
			description:
				'Create a new automation workflow. Define triggers, conditions, and actions to automate support processes.',
			schema: z.object({
				title: z.string().min(1).describe('Workflow name (required)'),
				description: z.string().optional().describe('Workflow description'),
				status: z
					.enum(['active', 'inactive'])
					.optional()
					.describe('Initial status (default: inactive)'),
				triggers: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Array of trigger definitions'),
				conditions: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Array of condition definitions'),
				actions: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Array of action definitions'),
			}),
			endpoint: '/workflows',
		}),

		putTool(client, {
			name: 'fluentsupport_workflow_update',
			title: 'Update Workflow',
			description:
				'Update an existing workflow. Can modify triggers, conditions, actions, status, or metadata.',
			schema: z.object({
				workflow_id: z.number().describe('Workflow ID'),
				title: z.string().optional().describe('Workflow name'),
				description: z.string().optional().describe('Workflow description'),
				status: z.enum(['active', 'inactive']).optional().describe('Workflow status'),
				triggers: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Updated trigger definitions'),
				conditions: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Updated condition definitions'),
				actions: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Updated action definitions'),
			}),
			endpoint: '/workflows/:workflow_id',
		}),

		deleteTool(client, {
			name: 'fluentsupport_workflow_delete',
			title: 'Delete Workflow',
			description:
				'Permanently delete a workflow. Active workflows should be deactivated first.',
			schema: z.object({
				workflow_id: z.number().describe('Workflow ID to delete'),
			}),
			endpoint: '/workflows/:workflow_id',
		}),
	]
}
