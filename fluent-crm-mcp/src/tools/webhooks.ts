import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { getTool, postTool, type ToolDefinition } from './_factory.js'

export function webhookTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_webhook_list',
			title: 'List Webhooks',
			description:
				'List all configured incoming webhooks. Webhooks allow external systems to create or update contacts and trigger automations in FluentCRM.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
			}),
			endpoint: '/webhooks',
		}),

		postTool(client, {
			name: 'fluentcrm_webhook_create',
			title: 'Create Webhook',
			description:
				'Create a new incoming webhook endpoint. The webhook URL can be used by external systems to push data into FluentCRM (contacts, tags, lists, funnels).',
			schema: z.object({
				name: z.string().min(1).describe('Webhook name (required)'),
				status: z
					.enum(['active', 'inactive'])
					.optional()
					.describe('Webhook status (default: active)'),
				lists: z.array(z.number()).optional().describe('Auto-assign contacts to these list IDs'),
				tags: z.array(z.number()).optional().describe('Auto-assign contacts these tag IDs'),
				url: z.string().optional().describe('Custom webhook URL slug'),
			}),
			endpoint: '/webhooks',
		}),
	]
}
