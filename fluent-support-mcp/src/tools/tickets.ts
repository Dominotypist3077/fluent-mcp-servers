import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function ticketTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_ticket_list',
			title: 'List Tickets',
			description:
				'List support tickets with optional filtering by status, priority, agent, customer, and product. Supports pagination and search.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
				search: z.string().optional().describe('Search tickets by title or content'),
				status: z
					.enum(['new', 'active', 'closed'])
					.optional()
					.describe('Filter by ticket status: new, active, closed'),
				priority: z
					.enum(['normal', 'medium', 'critical'])
					.optional()
					.describe('Filter by priority: normal, medium, critical'),
				agent_id: z.number().optional().describe('Filter by assigned agent ID'),
				customer_id: z.number().optional().describe('Filter by customer ID'),
				product_id: z.number().optional().describe('Filter by product ID'),
				sort_by: z
					.string()
					.optional()
					.describe('Sort field: id, created_at, updated_at, last_response (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/tickets',
		}),

		getTool(client, {
			name: 'fluentsupport_ticket_get',
			title: 'Get Ticket',
			description:
				'Get detailed information about a single support ticket including its current status, priority, assigned agent, customer, tags, and conversation history.',
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID'),
			}),
			endpoint: '/tickets/:ticket_id',
		}),

		createTool(client, {
			name: 'fluentsupport_ticket_create',
			title: 'Create Ticket',
			description:
				'Create a new support ticket. Requires a title, email (customer email), and content. Optionally assign an agent, priority, and product.',
			schema: z.object({
				title: z.string().min(1).describe('Ticket subject/title (required)'),
				content: z.string().min(1).describe('Ticket body/description in HTML (required)'),
				email: z.string().describe('Customer email address (required)'),
				customer_id: z.number().optional().describe('Customer ID (optional if email provided)'),
				agent_id: z.number().optional().describe('Agent ID to assign the ticket to'),
				priority: z
					.enum(['normal', 'medium', 'critical'])
					.optional()
					.describe('Ticket priority (default: normal)'),
				product_id: z.number().optional().describe('Associated product ID'),
				mailbox_id: z.number().optional().describe('Mailbox/inbox ID'),
			}),
			annotations: { openWorldHint: true },
			handler: async (client, input) => {
				const { title, content, email, customer_id, agent_id, priority, product_id, mailbox_id } = input as {
					title: string
					content: string
					email: string
					customer_id?: number
					agent_id?: number
					priority?: string
					product_id?: number
					mailbox_id?: number
				}
				const body: Record<string, unknown> = {
					ticket: { title, content, customer_id },
					email,
				}
				if (agent_id) body.agent_id = agent_id
				if (priority) body.priority = priority
				if (product_id) body.product_id = product_id
				if (mailbox_id) body.mailbox_id = mailbox_id
				const response = await client.post('/tickets', body)
				return response.data
			},
		}),

		putTool(client, {
			name: 'fluentsupport_ticket_update',
			title: 'Update Ticket',
			description:
				'Update ticket properties such as priority, agent assignment, product, or status. Pass only the fields you want to change.',
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID'),
				agent_id: z.number().optional().describe('Reassign to a different agent'),
				priority: z
					.enum(['normal', 'medium', 'critical'])
					.optional()
					.describe('Update priority'),
				product_id: z.number().optional().describe('Change associated product'),
				client_priority: z.string().optional().describe('Client-side priority label'),
			}),
			endpoint: '/tickets/:ticket_id',
			invalidates: ['ticket_stats'],
		}),

		postTool(client, {
			name: 'fluentsupport_ticket_reply',
			title: 'Reply to Ticket',
			description:
				'Add a response/reply to a ticket. The content supports HTML. You can add internal notes by setting is_internal to true.',
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID'),
				content: z.string().min(1).describe('Reply content in HTML (required)'),
				conversation_type: z
					.enum(['response', 'note'])
					.optional()
					.describe('Type of reply: response (visible to customer) or note (internal only). Default: response'),
			}),
			endpoint: '/tickets/:ticket_id/responses',
			invalidates: ['ticket_stats'],
		}),

		createTool(client, {
			name: 'fluentsupport_ticket_close',
			title: 'Close Ticket',
			description: 'Close an open ticket. Changes the ticket status to "closed".',
			annotations: { idempotentHint: true },
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID to close'),
			}),
			handler: async (c, input) => {
				const ticketId = input.ticket_id as number
				const resp = await c.put(`/tickets/${ticketId}/close`)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentsupport_ticket_reopen',
			title: 'Reopen Ticket',
			description: 'Reopen a closed ticket. Changes the ticket status back to "active".',
			annotations: { idempotentHint: true },
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID to reopen'),
			}),
			handler: async (c, input) => {
				const ticketId = input.ticket_id as number
				const resp = await c.put(`/tickets/${ticketId}/reopen`)
				return resp.data
			},
		}),

		deleteTool(client, {
			name: 'fluentsupport_ticket_delete',
			title: 'Delete Ticket',
			description:
				'Permanently delete a ticket. This action cannot be undone. All responses and attachments will also be deleted.',
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID to delete'),
			}),
			endpoint: '/tickets/:ticket_id',
			invalidates: ['ticket_stats'],
		}),

		postTool(client, {
			name: 'fluentsupport_ticket_bulk_actions',
			title: 'Bulk Ticket Actions',
			description:
				'Perform bulk operations on multiple tickets. Supported actions: close, reopen, delete, assign_agent, change_priority.',
			schema: z.object({
				action: z
					.enum(['close', 'reopen', 'delete', 'assign_agent', 'change_priority'])
					.describe('Bulk action to perform'),
				ticket_ids: z.array(z.number()).min(1).describe('Array of ticket IDs'),
				agent_id: z
					.number()
					.optional()
					.describe('Agent ID (required for assign_agent action)'),
				priority: z
					.enum(['normal', 'medium', 'critical'])
					.optional()
					.describe('Priority (required for change_priority action)'),
			}),
			endpoint: '/tickets/bulk-actions',
			invalidates: ['ticket_stats'],
		}),

		getTool(client, {
			name: 'fluentsupport_ticket_responses',
			title: 'List Ticket Responses',
			description:
				'Get all responses/replies for a specific ticket. Returns the full conversation thread including internal notes.',
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID'),
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
			}),
			endpoint: '/tickets/:ticket_id/responses',
		}),

		createTool(client, {
			name: 'fluentsupport_ticket_add_tag',
			title: 'Add Tag to Ticket',
			description: 'Add one or more tags to a ticket.',
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID'),
				tag_ids: z.array(z.number()).min(1).describe('Array of tag IDs to add'),
			}),
			handler: async (c, input) => {
				const ticketId = input.ticket_id as number
				const tagIds = input.tag_ids as number[]
				const resp = await c.post(`/tickets/${ticketId}/tags`, { tag_ids: tagIds })
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentsupport_ticket_remove_tag',
			title: 'Remove Tag from Ticket',
			description: 'Remove a tag from a ticket.',
			annotations: { destructiveHint: true },
			schema: z.object({
				ticket_id: z.number().describe('Ticket ID'),
				tag_id: z.number().describe('Tag ID to remove'),
			}),
			handler: async (c, input) => {
				const ticketId = input.ticket_id as number
				const tagId = input.tag_id as number
				const resp = await c.delete(`/tickets/${ticketId}/tags/${tagId}`)
				return resp.data
			},
		}),
	]
}
