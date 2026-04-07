import { z } from 'zod'
import type { FluentBoardsClient } from '../api/client.js'
import { createTool, deleteTool, getTool, putTool, type ToolDefinition } from './_factory.js'

export function labelTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentboards_label_list',
			title: 'List Labels',
			description:
				'List all labels for a specific board. Labels help categorize and visually tag tasks.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
			}),
			endpoint: '/projects/:board_id/labels',
		}),

		createTool(client, {
			name: 'fluentboards_label_create',
			title: 'Create Label',
			description:
				'Create a new label for a board. Requires a color and background color in hex format. Optionally provide a label title.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				label: z.string().optional().describe('Label title/name'),
				color: z.string().describe('Label text color in hex (e.g. #FFFFFF) (required)'),
				bg_color: z.string().describe('Label background color in hex (e.g. #3B82F6) (required)'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const body: Record<string, unknown> = {
					color: input.color,
					bg_color: input.bg_color,
				}
				if (input.label) body.label = input.label
				const resp = await c.post(`/projects/${boardId}/labels`, body)
				return resp.data
			},
		}),

		putTool(client, {
			name: 'fluentboards_label_update',
			title: 'Update Label',
			description: 'Update an existing label. You can change its title, text color, or background color.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				label_id: z.number().describe('Label ID'),
				label: z.string().optional().describe('Label title/name'),
				color: z.string().optional().describe('Label text color in hex'),
				bg_color: z.string().optional().describe('Label background color in hex'),
			}),
			endpoint: '/projects/:board_id/labels/:label_id',
		}),

		deleteTool(client, {
			name: 'fluentboards_label_delete',
			title: 'Delete Label',
			description:
				'Permanently delete a label from a board. Existing task associations will be removed.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				label_id: z.number().describe('Label ID to delete'),
			}),
			endpoint: '/projects/:board_id/labels/:label_id',
		}),

		createTool(client, {
			name: 'fluentboards_label_assign_to_task',
			title: 'Assign Label to Task',
			description: 'Assign a label to a task on a board.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID to assign the label to'),
				label_id: z.number().describe('Label ID to assign'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const taskId = input.task_id as number
				const labelId = input.label_id as number
				const resp = await c.post(`/projects/${boardId}/labels/task`, {
					taskId,
					labelId,
				})
				return resp.data
			},
		}),
	]
}
