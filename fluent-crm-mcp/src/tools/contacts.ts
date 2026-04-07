import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function contactTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_contact_list',
			title: 'List Contacts',
			description:
				'List CRM contacts (subscribers) with optional filtering by status, tags, lists, and search. Supports pagination.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search contacts by name or email'),
				status: z
					.enum(['subscribed', 'unsubscribed', 'pending', 'bounced', 'complained'])
					.optional()
					.describe('Filter by contact status'),
				tags: z
					.array(z.number())
					.optional()
					.describe('Filter by tag IDs (contacts must have ALL specified tags)'),
				lists: z
					.array(z.number())
					.optional()
					.describe('Filter by list IDs (contacts must be in ALL specified lists)'),
				sort_by: z
					.string()
					.optional()
					.describe('Sort field: id, first_name, email, created_at (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/subscribers',
			transform: (data: unknown) => {
				const resp = data as Record<string, unknown>
				const wrapper = (resp?.subscribers ?? resp) as Record<string, unknown>
				if (wrapper && Array.isArray(wrapper.data)) {
					wrapper.data = (wrapper.data as Record<string, unknown>[]).map((item) => ({
						id: item.id,
						first_name: item.first_name,
						last_name: item.last_name,
						email: item.email,
						status: item.status,
						tags: item.tags,
						lists: item.lists,
						created_at: item.created_at,
					}))
				}
				return resp
			},
		}),

		getTool(client, {
			name: 'fluentcrm_contact_get',
			title: 'Get Contact',
			description:
				'Get detailed information about a single contact including their tags, lists, custom fields, and activity history.',
			schema: z.object({
				id: z.number().describe('Contact/subscriber ID'),
			}),
			endpoint: '/subscribers/:id',
		}),

		createTool(client, {
			name: 'fluentcrm_contact_get_by_email',
			title: 'Get Contact by Email',
			description:
				'Look up a contact by their email address. Returns the full contact record if found.',
			annotations: { readOnlyHint: true, idempotentHint: true },
			schema: z.object({
				email: z.string().describe('Email address to look up'),
			}),
			handler: async (c, input) => {
				const email = input.email as string
				const resp = await c.get('/subscribers', { search: email, per_page: 1 })
				const data = resp.data as Record<string, unknown>
				const subscribers = data?.subscribers as Record<string, unknown> | undefined
				const items = (subscribers?.data ?? []) as Record<string, unknown>[]
				const match = items.find(
					(s) => (s.email as string)?.toLowerCase() === email.toLowerCase(),
				)
				if (!match) {
					return { found: false, message: `No contact found with email: ${email}` }
				}
				// Fetch full details
				const full = await c.get(`/subscribers/${match.id}`)
				return { found: true, contact: full.data }
			},
		}),

		postTool(client, {
			name: 'fluentcrm_contact_create',
			title: 'Create Contact',
			description:
				'Create a new CRM contact. Email is required. You can assign tags and lists at creation time.',
			schema: z.object({
				email: z.string().describe('Email address (required, must be unique)'),
				first_name: z.string().optional().describe('First name'),
				last_name: z.string().optional().describe('Last name'),
				status: z
					.enum(['subscribed', 'unsubscribed', 'pending'])
					.optional()
					.describe('Contact status (default: subscribed)'),
				tags: z.array(z.number()).optional().describe('Array of tag IDs to assign'),
				lists: z.array(z.number()).optional().describe('Array of list IDs to assign'),
				phone: z.string().optional().describe('Phone number'),
				address_line_1: z.string().optional().describe('Address line 1'),
				city: z.string().optional().describe('City'),
				state: z.string().optional().describe('State/province'),
				postal_code: z.string().optional().describe('Postal/zip code'),
				country: z.string().optional().describe('Country code (2-letter ISO)'),
				date_of_birth: z.string().optional().describe('Date of birth (YYYY-MM-DD)'),
				company_id: z.number().optional().describe('Company ID to associate'),
			}),
			endpoint: '/subscribers',
			invalidates: ['contact_list'],
		}),

		putTool(client, {
			name: 'fluentcrm_contact_update',
			title: 'Update Contact',
			description:
				'Update an existing contact. Pass only the fields you want to change. Does not modify tags or lists (use dedicated tag/list tools).',
			schema: z.object({
				id: z.number().describe('Contact/subscriber ID'),
				first_name: z.string().optional().describe('First name'),
				last_name: z.string().optional().describe('Last name'),
				email: z.string().optional().describe('Email address'),
				status: z
					.enum(['subscribed', 'unsubscribed', 'pending'])
					.optional()
					.describe('Contact status'),
				phone: z.string().optional().describe('Phone number'),
				address_line_1: z.string().optional().describe('Address line 1'),
				city: z.string().optional().describe('City'),
				state: z.string().optional().describe('State/province'),
				postal_code: z.string().optional().describe('Postal/zip code'),
				country: z.string().optional().describe('Country code (2-letter ISO)'),
				date_of_birth: z.string().optional().describe('Date of birth (YYYY-MM-DD)'),
			}),
			endpoint: '/subscribers/:id',
			invalidates: ['contact_list'],
		}),

		deleteTool(client, {
			name: 'fluentcrm_contact_delete',
			title: 'Delete Contact',
			description:
				'Permanently delete a contact from the CRM. This removes all associated data including tags, lists, and activity history.',
			schema: z.object({
				id: z.number().describe('Contact/subscriber ID to delete'),
			}),
			endpoint: '/subscribers/:id',
			invalidates: ['contact_list'],
		}),

		createTool(client, {
			name: 'fluentcrm_contact_add_tags',
			title: 'Add Tags to Contact',
			description: 'Add one or more tags to a contact. Existing tags are preserved.',
			schema: z.object({
				id: z.number().describe('Contact/subscriber ID'),
				tag_ids: z.array(z.number()).min(1).describe('Array of tag IDs to add'),
			}),
			handler: async (c, input) => {
				const id = input.id as number
				const tagIds = input.tag_ids as number[]
				const resp = await c.post(`/subscribers/${id}/tags`, { tags: tagIds })
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcrm_contact_remove_tags',
			title: 'Remove Tags from Contact',
			description: 'Remove one or more tags from a contact.',
			annotations: { destructiveHint: true },
			schema: z.object({
				id: z.number().describe('Contact/subscriber ID'),
				tag_ids: z.array(z.number()).min(1).describe('Array of tag IDs to remove'),
			}),
			handler: async (c, input) => {
				const id = input.id as number
				const tagIds = input.tag_ids as number[]
				const resp = await c.post(`/subscribers/${id}/tags/detach`, { tags: tagIds })
				return resp.data
			},
		}),
	]
}
