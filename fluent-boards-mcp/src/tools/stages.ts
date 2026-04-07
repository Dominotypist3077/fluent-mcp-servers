import { z } from 'zod'
import type { FluentBoardsClient } from '../api/client.js'
import { createTool, getTool, putTool, type ToolDefinition } from './_factory.js'

export function stageTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentboards_stage_list',
			title: 'List Archived Stages',
			description:
				'List archived stages for a board. Active stages are returned as part of the board details (use board_get). This endpoint returns only archived/soft-deleted stages.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 30, max: 50)'),
			}),
			endpoint: '/projects/:board_id/archived-stages',
		}),

		createTool(client, {
			name: 'fluentboards_stage_create',
			title: 'Create Stage',
			description:
				'Create a new stage (column) on a board. The stage is added at the end by default, or at the specified position.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				title: z.string().min(1).describe('Stage name (required)'),
				position: z.number().optional().describe('Position within the board (0-based)'),
				status: z
					.enum(['open', 'closed'])
					.optional()
					.describe('Default task status for this stage (default: open)'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const body: Record<string, unknown> = {
					title: input.title,
				}
				if (input.position !== undefined) body.position = input.position
				if (input.status) body.status = input.status
				const resp = await c.post(`/projects/${boardId}/stage-create`, body)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_stage_update',
			title: 'Update Stage',
			description: 'Update stage properties such as title or settings.',
			annotations: { idempotentHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				stage_id: z.number().describe('Stage ID'),
				title: z.string().optional().describe('Stage name'),
				settings: z
					.record(z.string(), z.unknown())
					.optional()
					.describe('Stage configuration object'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const stageId = input.stage_id as number
				const body: Record<string, unknown> = {}
				if (input.title) body.title = input.title
				if (input.settings) body.settings = input.settings
				const resp = await c.put(`/projects/${boardId}/update-stage/${stageId}`, body)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_stage_delete',
			title: 'Archive Stage',
			description:
				'Archive (soft-delete) a stage. The stage and its tasks are hidden but can be restored later.',
			annotations: { destructiveHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				stage_id: z.number().describe('Stage ID to archive'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const stageId = input.stage_id as number
				const resp = await c.put(`/projects/${boardId}/archive-stage/${stageId}`)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_stage_reorder',
			title: 'Reorder Stages',
			description:
				'Update the positions of multiple stages at once. Pass an array of stage IDs in the desired order.',
			annotations: { idempotentHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				list: z
					.array(z.number())
					.min(1)
					.describe('Array of stage IDs in the desired order'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const list = input.list as number[]
				const resp = await c.put(`/projects/${boardId}/re-position-stages`, { list })
				return resp.data
			},
		}),
	]
}
