import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { createTool, getTool, postTool, type ToolDefinition } from './_factory.js'

export function campaignTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_campaign_list',
			title: 'List Campaigns',
			description:
				'List email campaigns with optional filtering by status. Returns campaign summaries including send stats.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search campaigns by title'),
				status: z
					.enum(['draft', 'scheduled', 'working', 'sent', 'purged'])
					.optional()
					.describe('Filter by campaign status'),
				sort_by: z.string().optional().describe('Sort field: id, title, created_at (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/campaigns',
		}),

		getTool(client, {
			name: 'fluentcrm_campaign_get',
			title: 'Get Campaign',
			description:
				'Get detailed information about a single campaign including its settings, recipients, email body, and performance stats.',
			schema: z.object({
				id: z.number().describe('Campaign ID'),
			}),
			endpoint: '/campaigns/:id',
		}),

		postTool(client, {
			name: 'fluentcrm_campaign_create',
			title: 'Create Campaign',
			description:
				'Create a new email campaign in draft status. You can specify the subject, body, recipients (by tags/lists), and template.',
			schema: z.object({
				title: z.string().min(1).describe('Campaign title/name (required)'),
				subject: z.string().optional().describe('Email subject line'),
				email_body: z.string().optional().describe('Email body content (HTML)'),
				email_pre_header: z.string().optional().describe('Email preview/pre-header text'),
				template_id: z.number().optional().describe('Email template ID to use'),
				utm_status: z.boolean().optional().describe('Enable UTM tracking (default: false)'),
				utm_source: z.string().optional().describe('UTM source parameter'),
				utm_medium: z.string().optional().describe('UTM medium parameter'),
				utm_campaign: z.string().optional().describe('UTM campaign parameter'),
				design_template: z.string().optional().describe('Design template type: classic, raw_classic, visual_builder'),
			}),
			endpoint: '/campaigns',
		}),

		createTool(client, {
			name: 'fluentcrm_campaign_schedule',
			title: 'Schedule Campaign',
			description:
				'Schedule a draft campaign for sending. You must specify the recipients (by tags/lists) and optionally a send date. If no date is given, the campaign will be sent immediately.',
			schema: z.object({
				id: z.number().describe('Campaign ID'),
				scheduled_at: z
					.string()
					.optional()
					.describe('Scheduled send date/time (YYYY-MM-DD HH:mm:ss). If omitted, sends immediately.'),
				subscribers: z
					.array(z.number())
					.optional()
					.describe('Array of specific subscriber IDs to send to'),
				tags: z.array(z.number()).optional().describe('Send to contacts with these tag IDs'),
				lists: z.array(z.number()).optional().describe('Send to contacts in these list IDs'),
				excluded_tags: z.array(z.number()).optional().describe('Exclude contacts with these tag IDs'),
				excluded_lists: z.array(z.number()).optional().describe('Exclude contacts in these list IDs'),
			}),
			handler: async (c, input) => {
				const id = input.id as number
				const { id: _, ...body } = input
				const resp = await c.put(`/campaigns/${id}/schedule`, body as Record<string, unknown>)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcrm_campaign_pause',
			title: 'Pause Campaign',
			description: 'Pause a currently sending (working) campaign. Can be resumed later.',
			annotations: { idempotentHint: true },
			schema: z.object({
				id: z.number().describe('Campaign ID to pause'),
			}),
			handler: async (c, input) => {
				const id = input.id as number
				const resp = await c.put(`/campaigns/${id}/pause`)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcrm_campaign_resume',
			title: 'Resume Campaign',
			description: 'Resume a paused campaign to continue sending.',
			annotations: { idempotentHint: true },
			schema: z.object({
				id: z.number().describe('Campaign ID to resume'),
			}),
			handler: async (c, input) => {
				const id = input.id as number
				const resp = await c.put(`/campaigns/${id}/resume`)
				return resp.data
			},
		}),
	]
}
