import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function reportTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_report_dashboard',
			title: 'Get Dashboard Stats',
			description:
				'Get CRM dashboard statistics: total contacts, active subscribers, unsubscribed, emails sent, open rate, click rate, and more.',
			schema: z.object({}),
			endpoint: '/reports/dashboard',
			cache: { key: 'report_dashboard', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentcrm_report_subscribers_growth',
			title: 'Get Subscribers Growth',
			description:
				'Get subscriber growth trends over time. Shows new subscribers per day/week/month in the given date range.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				group_by: z
					.enum(['day', 'week', 'month'])
					.optional()
					.describe('Grouping interval (default: day)'),
			}),
			endpoint: '/reports/subscribers',
		}),

		getTool(client, {
			name: 'fluentcrm_report_campaign_stats',
			title: 'Get Campaign Stats',
			description:
				'Get aggregated campaign performance statistics: emails sent, opens, clicks, unsubscribes, bounces, and revenue attribution.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				campaign_id: z.number().optional().describe('Filter by specific campaign ID'),
			}),
			endpoint: '/reports/emails',
		}),
	]
}
