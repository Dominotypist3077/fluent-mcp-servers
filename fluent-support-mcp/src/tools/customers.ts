import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function customerTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_customer_list',
			title: 'List Customers',
			description:
				'List support customers with optional search and pagination. Customers are the people who submit tickets.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
				search: z.string().optional().describe('Search by name or email'),
				sort_by: z
					.string()
					.optional()
					.describe('Sort field: id, first_name, email, created_at (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/customers',
			transform: (data: unknown) => {
				const resp = data as Record<string, unknown>
				const wrapper = (resp?.customers ?? resp) as Record<string, unknown>
				if (wrapper && Array.isArray(wrapper.data)) {
					wrapper.data = (wrapper.data as Record<string, unknown>[]).map((item) => ({
						id: item.id,
						first_name: item.first_name,
						last_name: item.last_name,
						email: item.email,
						status: item.status,
						ticket_count: item.ticket_count,
						created_at: item.created_at,
					}))
				}
				return resp
			},
		}),

		getTool(client, {
			name: 'fluentsupport_customer_get',
			title: 'Get Customer',
			description:
				'Get detailed customer information including their support history, ticket count, and profile data.',
			schema: z.object({
				customer_id: z.number().describe('Customer ID'),
			}),
			endpoint: '/customers/:customer_id',
		}),

		postTool(client, {
			name: 'fluentsupport_customer_create',
			title: 'Create Customer',
			description:
				'Create a new support customer. Email is required and must be unique. The customer can then submit tickets.',
			schema: z.object({
				email: z.string().describe('Customer email address (required, must be unique)'),
				first_name: z.string().optional().describe('First name'),
				last_name: z.string().optional().describe('Last name'),
				phone: z.string().optional().describe('Phone number'),
				status: z
					.enum(['active', 'inactive'])
					.optional()
					.describe('Customer status (default: active)'),
			}),
			endpoint: '/customers',
		}),

		createTool(client, {
			name: 'fluentsupport_customer_update',
			title: 'Update Customer',
			description:
				'Update customer profile fields. Fetches current state first to ensure required fields are preserved.',
			annotations: { idempotentHint: true },
			schema: z.object({
				customer_id: z.number().describe('Customer ID'),
				first_name: z.string().optional().describe('First name'),
				last_name: z.string().optional().describe('Last name'),
				email: z.string().optional().describe('Email address'),
				phone: z.string().optional().describe('Phone number'),
				status: z.enum(['active', 'inactive']).optional().describe('Customer status'),
			}),
			handler: async (c, input) => {
				const customerId = input.customer_id as number
				const current = await c.get(`/customers/${customerId}`)
				const wrapper = current.data as Record<string, unknown>
				const customer = (wrapper.customer ?? wrapper) as Record<string, unknown>
				const { customer_id, ...changes } = input
				const merged: Record<string, unknown> = {
					id: customerId,
					first_name: customer.first_name,
					last_name: customer.last_name,
					email: customer.email,
					...changes,
				}
				const resp = await c.put(`/customers/${customerId}`, merged)
				return resp.data
			},
		}),

		deleteTool(client, {
			name: 'fluentsupport_customer_delete',
			title: 'Delete Customer',
			description:
				'Permanently delete a customer. This will NOT delete their tickets, but will disassociate them.',
			schema: z.object({
				customer_id: z.number().describe('Customer ID to delete'),
			}),
			endpoint: '/customers/:customer_id',
		}),

		getTool(client, {
			name: 'fluentsupport_customer_tickets',
			title: 'Get Customer Tickets',
			description:
				'List all tickets submitted by a specific customer. Useful for viewing support history.',
			schema: z.object({
				customer_id: z.number().describe('Customer ID'),
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 10, max: 50)'),
			}),
			endpoint: '/customers/:customer_id/tickets',
		}),
	]
}
