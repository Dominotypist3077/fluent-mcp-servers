import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function tagTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_tag_list',
			title: 'List Tags',
			description:
				'List all CRM tags. Tags are used to categorize and segment contacts for targeted campaigns and automations.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(100).optional().describe('Results per page (default: 20, max: 100)'),
				search: z.string().optional().describe('Search tags by title'),
				sort_by: z.string().optional().describe('Sort field: id, title, created_at (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/tags',
			cache: { key: 'tag_list', ttlMs: TTL.MEDIUM },
		}),

		postTool(client, {
			name: 'fluentcrm_tag_create',
			title: 'Create Tag',
			description: 'Create a new CRM tag for categorizing contacts.',
			schema: z.object({
				title: z.string().min(1).describe('Tag name (required)'),
				slug: z.string().optional().describe('URL-friendly slug (auto-generated if omitted)'),
				description: z.string().optional().describe('Tag description'),
			}),
			endpoint: '/tags',
			invalidates: ['tag_list'],
		}),

		putTool(client, {
			name: 'fluentcrm_tag_update',
			title: 'Update Tag',
			description: 'Update an existing tag name, slug, or description.',
			schema: z.object({
				id: z.number().describe('Tag ID'),
				title: z.string().optional().describe('Tag name'),
				slug: z.string().optional().describe('URL-friendly slug'),
				description: z.string().optional().describe('Tag description'),
			}),
			endpoint: '/tags/:id',
			invalidates: ['tag_list'],
		}),

		deleteTool(client, {
			name: 'fluentcrm_tag_delete',
			title: 'Delete Tag',
			description:
				'Permanently delete a tag. Contacts that had this tag will have it removed, but the contacts themselves are not deleted.',
			schema: z.object({
				id: z.number().describe('Tag ID to delete'),
			}),
			endpoint: '/tags/:id',
			invalidates: ['tag_list'],
		}),

		createTool(client, {
			name: 'fluentcrm_tag_attach_to_contact',
			title: 'Attach Tag to Contact',
			description:
				'Attach a tag to one or more contacts by their subscriber IDs. This is an alternative to fluentcrm_contact_add_tags when you want to work from the tag perspective.',
			schema: z.object({
				tag_id: z.number().describe('Tag ID to attach'),
				subscriber_ids: z.array(z.number()).min(1).describe('Array of contact/subscriber IDs'),
			}),
			handler: async (c, input) => {
				const tagId = input.tag_id as number
				const subscriberIds = input.subscriber_ids as number[]
				// Apply tag to each subscriber
				const results: unknown[] = []
				for (const subId of subscriberIds) {
					const resp = await c.post(`/subscribers/${subId}/tags`, { tags: [tagId] })
					results.push({ subscriber_id: subId, result: resp.data })
				}
				return { tag_id: tagId, attached_to: subscriberIds.length, results }
			},
		}),
	]
}
