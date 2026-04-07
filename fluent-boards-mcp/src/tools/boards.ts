import { z } from 'zod'
import type { FluentBoardsClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, deleteTool, getTool, putTool, type ToolDefinition } from './_factory.js'

export function boardTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentboards_board_list',
			title: 'List Boards',
			description:
				'List all project boards with optional filtering by type, search, and pagination. Boards are the top-level containers for stages and tasks.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
				search: z.string().optional().describe('Search boards by title'),
				type: z
					.enum(['to-do', 'roadmap'])
					.optional()
					.describe('Filter by board type: to-do or roadmap'),
				order_by: z
					.string()
					.optional()
					.describe('Sort field: id, title, created_at (default: id)'),
				order_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/projects',
			cache: { key: 'board_list', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentboards_board_get',
			title: 'Get Board',
			description:
				'Get detailed information about a single board including its stages, settings, and metadata.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
			}),
			endpoint: '/projects/:board_id',
		}),

		createTool(client, {
			name: 'fluentboards_board_create',
			title: 'Create Board',
			description:
				'Create a new project board. Requires a title and type (to-do or roadmap). Optionally include a description, currency, folder, and initial stages.',
			schema: z.object({
				title: z.string().min(1).describe('Board title (required)'),
				description: z.string().optional().describe('Board description'),
				type: z
					.enum(['to-do', 'roadmap'])
					.describe('Board type: to-do (kanban) or roadmap (required)'),
				currency: z.string().optional().describe('Currency code (e.g. USD, EUR)'),
				folder_id: z.number().optional().describe('Folder ID to place the board in'),
			}),
			handler: async (c, input) => {
				const { title, description, type, currency, folder_id } = input as {
					title: string
					description?: string
					type: string
					currency?: string
					folder_id?: number
				}
				const body: Record<string, unknown> = {
					board: { title, description, type, currency },
				}
				if (folder_id) body.folder_id = folder_id
				const resp = await c.post('/projects', body)
				return resp.data
			},
		}),

		putTool(client, {
			name: 'fluentboards_board_update',
			title: 'Update Board',
			description:
				'Update board properties such as title or description. Pass only the fields you want to change.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				title: z.string().optional().describe('Board title'),
				description: z.string().optional().describe('Board description'),
			}),
			endpoint: '/projects/:board_id',
			invalidates: ['board_list'],
		}),

		deleteTool(client, {
			name: 'fluentboards_board_delete',
			title: 'Delete Board',
			description:
				'Permanently delete a board. This action cannot be undone. All stages, tasks, and associated data will also be deleted.',
			schema: z.object({
				board_id: z.number().describe('Board ID to delete'),
			}),
			endpoint: '/projects/:board_id',
			invalidates: ['board_list'],
		}),

		createTool(client, {
			name: 'fluentboards_board_archive',
			title: 'Archive Board',
			description: 'Archive a board. Archived boards can be restored later.',
			annotations: { idempotentHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID to archive'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const resp = await c.put(`/projects/${boardId}/archive-board`)
				return resp.data
			},
		}),
	]
}
