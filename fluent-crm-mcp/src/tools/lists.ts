import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function listTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_list_list',
			title: 'List Lists',
			description:
				'List all CRM lists (mailing lists). Lists are used to organize contacts into groups for campaigns and segmentation.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(100).optional().describe('Results per page (default: 20, max: 100)'),
				search: z.string().optional().describe('Search lists by title'),
				sort_by: z.string().optional().describe('Sort field: id, title, created_at (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/lists',
			cache: { key: 'list_list', ttlMs: TTL.MEDIUM },
		}),

		postTool(client, {
			name: 'fluentcrm_list_create',
			title: 'Create List',
			description: 'Create a new mailing list for organizing contacts.',
			schema: z.object({
				title: z.string().min(1).describe('List name (required)'),
				slug: z.string().optional().describe('URL-friendly slug (auto-generated if omitted)'),
				description: z.string().optional().describe('List description'),
			}),
			endpoint: '/lists',
			invalidates: ['list_list'],
		}),

		putTool(client, {
			name: 'fluentcrm_list_update',
			title: 'Update List',
			description: 'Update an existing list name, slug, or description.',
			schema: z.object({
				id: z.number().describe('List ID'),
				title: z.string().optional().describe('List name'),
				slug: z.string().optional().describe('URL-friendly slug'),
				description: z.string().optional().describe('List description'),
			}),
			endpoint: '/lists/:id',
			invalidates: ['list_list'],
		}),

		deleteTool(client, {
			name: 'fluentcrm_list_delete',
			title: 'Delete List',
			description:
				'Permanently delete a list. Contacts in this list are not deleted, but their association with this list is removed.',
			schema: z.object({
				id: z.number().describe('List ID to delete'),
			}),
			endpoint: '/lists/:id',
			invalidates: ['list_list'],
		}),

		createTool(client, {
			name: 'fluentcrm_list_attach_contact',
			title: 'Add Contact to List',
			description: 'Add one or more contacts to a mailing list by their subscriber IDs.',
			schema: z.object({
				list_id: z.number().describe('List ID'),
				subscriber_ids: z.array(z.number()).min(1).describe('Array of contact/subscriber IDs to add'),
			}),
			handler: async (c, input) => {
				const listId = input.list_id as number
				const subscriberIds = input.subscriber_ids as number[]
				const results: unknown[] = []
				for (const subId of subscriberIds) {
					const resp = await c.post(`/subscribers/${subId}/lists`, { lists: [listId] })
					results.push({ subscriber_id: subId, result: resp.data })
				}
				return { list_id: listId, added: subscriberIds.length, results }
			},
		}),
	]
}
