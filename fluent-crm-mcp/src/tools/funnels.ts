import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { createTool, getTool, postTool, type ToolDefinition } from './_factory.js'

export function funnelTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_funnel_list',
			title: 'List Automations/Funnels',
			description:
				'List all automation funnels. Funnels are multi-step workflows triggered by events (signup, tag added, purchase, etc.).',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search funnels by title'),
				status: z
					.enum(['draft', 'published'])
					.optional()
					.describe('Filter by funnel status'),
			}),
			endpoint: '/funnels',
		}),

		getTool(client, {
			name: 'fluentcrm_funnel_get',
			title: 'Get Automation/Funnel',
			description:
				'Get detailed information about a specific funnel including all its steps, triggers, and subscriber metrics.',
			schema: z.object({
				id: z.number().describe('Funnel ID'),
			}),
			endpoint: '/funnels/:id',
		}),

		postTool(client, {
			name: 'fluentcrm_funnel_create',
			title: 'Create Automation/Funnel',
			description:
				'Create a new automation funnel. Funnels start in draft status. Add triggers and actions, then publish to activate.',
			schema: z.object({
				title: z.string().min(1).describe('Funnel title/name (required)'),
				description: z.string().optional().describe('Funnel description'),
				status: z
					.enum(['draft', 'published'])
					.optional()
					.describe('Initial status (default: draft)'),
				trigger_name: z
					.string()
					.optional()
					.describe('Trigger type: e.g., fluentcrm_contact_added_to_tags, fluentcrm_contact_added_to_lists, fluent_form_submission, etc.'),
				conditions: z
					.array(z.record(z.string(), z.unknown()))
					.optional()
					.describe('Trigger conditions'),
				settings: z
					.record(z.string(), z.unknown())
					.optional()
					.describe('Funnel settings'),
			}),
			endpoint: '/funnels',
		}),

		createTool(client, {
			name: 'fluentcrm_funnel_trigger',
			title: 'Trigger Funnel for Contact',
			description:
				'Manually trigger a funnel for a specific contact via the webhook endpoint. The contact will enter the funnel as if the trigger event had occurred.',
			schema: z.object({
				funnel_id: z.number().describe('Funnel ID to trigger'),
				email: z.string().describe('Email address of the contact to enter into the funnel'),
			}),
			handler: async (c, input) => {
				const funnelId = input.funnel_id as number
				const email = input.email as string
				const resp = await c.post('/webhooks/funnel-trigger', {
					funnel_id: funnelId,
					email,
				})
				return resp.data
			},
		}),
	]
}
