import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function settingsTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		// --- Tags ---
		getTool(client, {
			name: 'fluentsupport_tag_list',
			title: 'List Tags',
			description:
				'List all ticket tags. Tags help categorize and organize tickets for filtering and reporting.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(100).optional().describe('Results per page (default: 20, max: 100)'),
				search: z.string().optional().describe('Search tags by name'),
			}),
			endpoint: '/ticket-tags',
			cache: { key: 'tag_list', ttlMs: TTL.MEDIUM },
		}),

		postTool(client, {
			name: 'fluentsupport_tag_create',
			title: 'Create Tag',
			description: 'Create a new ticket tag for categorizing tickets.',
			schema: z.object({
				title: z.string().min(1).describe('Tag name (required)'),
				description: z.string().optional().describe('Tag description'),
			}),
			endpoint: '/ticket-tags',
			invalidates: ['tag_list'],
		}),

		putTool(client, {
			name: 'fluentsupport_tag_update',
			title: 'Update Tag',
			description: 'Update an existing tag name or description.',
			schema: z.object({
				tag_id: z.number().describe('Tag ID'),
				title: z.string().optional().describe('Tag name'),
				description: z.string().optional().describe('Tag description'),
			}),
			endpoint: '/ticket-tags/:tag_id',
			invalidates: ['tag_list'],
		}),

		deleteTool(client, {
			name: 'fluentsupport_tag_delete',
			title: 'Delete Tag',
			description:
				'Permanently delete a tag. Existing ticket associations will be removed.',
			schema: z.object({
				tag_id: z.number().describe('Tag ID to delete'),
			}),
			endpoint: '/ticket-tags/:tag_id',
			invalidates: ['tag_list'],
		}),

		// --- Products ---
		getTool(client, {
			name: 'fluentsupport_product_list',
			title: 'List Products',
			description:
				'List all products. Products can be associated with tickets to track which product a support request is about.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(100).optional().describe('Results per page (default: 20, max: 100)'),
				search: z.string().optional().describe('Search products by name'),
			}),
			endpoint: '/settings/products',
			cache: { key: 'product_list', ttlMs: TTL.MEDIUM },
		}),

		postTool(client, {
			name: 'fluentsupport_product_create',
			title: 'Create Product',
			description: 'Create a new product for ticket categorization.',
			schema: z.object({
				title: z.string().min(1).describe('Product name (required)'),
				description: z.string().optional().describe('Product description'),
			}),
			endpoint: '/settings/products',
			invalidates: ['product_list'],
		}),

		putTool(client, {
			name: 'fluentsupport_product_update',
			title: 'Update Product',
			description: 'Update an existing product name or description.',
			schema: z.object({
				product_id: z.number().describe('Product ID'),
				title: z.string().optional().describe('Product name'),
				description: z.string().optional().describe('Product description'),
			}),
			endpoint: '/settings/products/:product_id',
			invalidates: ['product_list'],
		}),

		deleteTool(client, {
			name: 'fluentsupport_product_delete',
			title: 'Delete Product',
			description:
				'Permanently delete a product. Existing ticket associations will be removed.',
			schema: z.object({
				product_id: z.number().describe('Product ID to delete'),
			}),
			endpoint: '/settings/products/:product_id',
			invalidates: ['product_list'],
		}),

		// --- General Settings ---
		getTool(client, {
			name: 'fluentsupport_settings_get',
			title: 'Get Settings',
			description:
				'Get Fluent Support general settings: business hours, email notifications, ticket defaults, and more.',
			schema: z.object({
				group: z
					.string()
					.optional()
					.describe('Settings group to retrieve (e.g., "general", "email", "ticket_defaults")'),
			}),
			endpoint: '/settings',
			cache: { key: 'settings_general', ttlMs: TTL.LONG },
		}),

		getTool(client, {
			name: 'fluentsupport_settings_mailboxes',
			title: 'Get Mailboxes',
			description:
				'List all configured mailboxes/inboxes. Mailboxes determine where incoming ticket emails are received.',
			schema: z.object({}),
			endpoint: '/settings/mailboxes',
			cache: { key: 'mailboxes', ttlMs: TTL.MEDIUM },
		}),
	]
}
