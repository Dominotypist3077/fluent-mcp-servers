import { z } from 'zod'
import type { FluentBoardsClient } from '../api/client.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function commentTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentboards_comment_list',
			title: 'List Task Comments',
			description:
				'List all comments for a specific task. Returns the conversation thread including replies.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID'),
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Comments per page (default: 10, max: 50)'),
			}),
			endpoint: '/projects/:board_id/tasks/:task_id/comments',
		}),

		createTool(client, {
			name: 'fluentboards_comment_create',
			title: 'Create Comment',
			description:
				'Add a new comment to a task. Supports threaded replies via parent_id.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID'),
				comment: z.string().min(1).describe('Comment content (required)'),
				parent_id: z
					.number()
					.optional()
					.describe('Parent comment ID for threaded replies'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const taskId = input.task_id as number
				const body: Record<string, unknown> = {
					comment: input.comment,
					comment_type: input.parent_id ? 'reply' : 'comment',
				}
				if (input.parent_id) body.parent_id = input.parent_id
				const resp = await c.post(
					`/projects/${boardId}/tasks/${taskId}/comments`,
					body,
				)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_comment_delete',
			title: 'Delete Comment',
			description:
				'Delete a comment from a task. This also removes any threaded replies and attachments.',
			annotations: { destructiveHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				comment_id: z.number().describe('Comment ID to delete'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const commentId = input.comment_id as number
				const resp = await c.delete(`/projects/${boardId}/tasks/comments/${commentId}`)
				return resp.data
			},
		}),
	]
}
