import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function notificationTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_notification_list',
			title: 'List Notifications',
			description:
				'List notifications for the authenticated user. Shows mentions, replies, reactions, and other community activity notifications. Supports pagination.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
				is_read: z.boolean().optional().describe('Filter by read status: true for read, false for unread'),
			}),
			endpoint: '/notifications',
		}),

		createTool(client, {
			name: 'fluentcommunity_notification_mark_read',
			title: 'Mark Notifications as Read',
			description:
				'Mark one or more notifications as read. Pass specific notification IDs or omit to mark all unread notifications as read.',
			annotations: { idempotentHint: true },
			schema: z.object({
				notification_ids: z
					.array(z.number())
					.optional()
					.describe('Specific notification IDs to mark as read. If omitted, marks all as read.'),
			}),
			handler: async (c, input) => {
				const ids = input.notification_ids as number[] | undefined
				const body: Record<string, unknown> = {}
				if (ids && ids.length > 0) {
					body.notification_ids = ids
				}
				const resp = await c.post('/notifications/mark-read', body)
				return resp.data
			},
		}),
	]
}
