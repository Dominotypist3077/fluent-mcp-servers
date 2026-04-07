import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function savedReplyTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_saved_reply_list',
			title: 'List Saved Replies',
			description:
				'List all saved reply templates. Saved replies are pre-written response templates that agents can quickly insert when replying to tickets.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
				search: z.string().optional().describe('Search templates by title or content'),
			}),
			endpoint: '/saved-replies',
			cache: { key: 'saved_replies', ttlMs: TTL.MEDIUM },
		}),

		getTool(client, {
			name: 'fluentsupport_saved_reply_get',
			title: 'Get Saved Reply',
			description: 'Get full details of a specific saved reply template including its content.',
			schema: z.object({
				reply_id: z.number().describe('Saved reply ID'),
			}),
			endpoint: '/saved-replies/:reply_id',
		}),

		postTool(client, {
			name: 'fluentsupport_saved_reply_create',
			title: 'Create Saved Reply',
			description:
				'Create a new saved reply template. Use dynamic placeholders like {{customer.name}}, {{ticket.title}} for personalized responses.',
			schema: z.object({
				title: z.string().min(1).describe('Template title/name (required)'),
				content: z
					.string()
					.min(1)
					.describe(
						'Reply content in HTML (required). Supports placeholders like {{customer.name}}, {{ticket.title}}, {{agent.name}}',
					),
			}),
			endpoint: '/saved-replies',
			invalidates: ['saved_replies'],
		}),

		putTool(client, {
			name: 'fluentsupport_saved_reply_update',
			title: 'Update Saved Reply',
			description: 'Update an existing saved reply template. Pass only the fields to change.',
			schema: z.object({
				reply_id: z.number().describe('Saved reply ID'),
				title: z.string().optional().describe('Template title/name'),
				content: z.string().optional().describe('Reply content in HTML'),
			}),
			endpoint: '/saved-replies/:reply_id',
			invalidates: ['saved_replies'],
		}),

		deleteTool(client, {
			name: 'fluentsupport_saved_reply_delete',
			title: 'Delete Saved Reply',
			description: 'Permanently delete a saved reply template.',
			schema: z.object({
				reply_id: z.number().describe('Saved reply ID to delete'),
			}),
			endpoint: '/saved-replies/:reply_id',
			invalidates: ['saved_replies'],
		}),
	]
}
