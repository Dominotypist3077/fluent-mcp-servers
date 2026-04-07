import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function commentTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_comment_list',
			title: 'List Comments',
			description:
				'List comments for a specific post/feed. Returns comment content, author info, and nested replies. Supports pagination.',
			schema: z.object({
				feed_id: z.number().describe('Post/feed ID to get comments for'),
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
			}),
			endpoint: '/feeds/:feed_id/comments',
		}),

		postTool(client, {
			name: 'fluentcommunity_comment_create',
			title: 'Create Comment',
			description:
				'Add a comment to a post/feed. Supports threaded replies by specifying a parent_id for the comment being replied to.',
			schema: z.object({
				feed_id: z.number().describe('Post/feed ID to comment on (required)'),
				message: z.string().min(1).describe('Comment content (required). Supports HTML formatting.'),
				parent_id: z.number().optional().describe('Parent comment ID for nested/threaded replies'),
			}),
			endpoint: '/feeds/:feed_id/comments',
		}),

		createTool(client, {
			name: 'fluentcommunity_comment_update',
			title: 'Update Comment',
			description:
				'Update the content of an existing comment. Only the comment author or administrators can update a comment.',
			annotations: { idempotentHint: true },
			schema: z.object({
				comment_id: z.number().describe('Comment ID to update'),
				message: z.string().min(1).describe('Updated comment content'),
			}),
			handler: async (c, input) => {
				const commentId = input.comment_id as number
				const message = input.message as string
				const resp = await c.put(`/comments/${commentId}`, { message })
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcommunity_comment_delete',
			title: 'Delete Comment',
			description:
				'Permanently delete a comment. If the comment has replies, they will also be removed. This action cannot be undone.',
			annotations: { destructiveHint: true },
			schema: z.object({
				comment_id: z.number().describe('Comment ID to delete'),
			}),
			handler: async (c, input) => {
				const commentId = input.comment_id as number
				const resp = await c.delete(`/comments/${commentId}`)
				return resp.data
			},
		}),
	]
}
