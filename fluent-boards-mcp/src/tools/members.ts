import { z } from 'zod'
import type { FluentBoardsClient } from '../api/client.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function memberTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentboards_member_list',
			title: 'List Board Members',
			description:
				'List all members of a specific board including their roles (admin, member, viewer).',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
			}),
			endpoint: '/projects/:board_id/users',
		}),

		createTool(client, {
			name: 'fluentboards_member_add',
			title: 'Add Member to Board',
			description:
				'Add a user to a board as a member or viewer. The user must already exist in WordPress.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				member_id: z.number().describe('WordPress user ID to add'),
				is_viewer_only: z
					.boolean()
					.optional()
					.describe('Set to true for viewer-only access (default: false = full member)'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const body: Record<string, unknown> = {
					memberId: input.member_id,
				}
				if (input.is_viewer_only) body.isViewerOnly = 'yes'
				const resp = await c.post(`/projects/${boardId}/add-members`, body)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_member_remove',
			title: 'Remove Member from Board',
			description:
				'Remove a user from a board. Their task assignments on this board may need reassignment.',
			annotations: { destructiveHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				user_id: z.number().describe('User ID to remove'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const userId = input.user_id as number
				const resp = await c.post(`/projects/${boardId}/user/${userId}/remove`)
				return resp.data
			},
		}),
	]
}
