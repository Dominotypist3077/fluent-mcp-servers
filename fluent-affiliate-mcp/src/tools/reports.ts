import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function reportTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_report_dashboard_stats',
			title: 'Get Dashboard Stats',
			description:
				'Get affiliate program dashboard statistics: total affiliates, total referrals, total earnings, unpaid commissions, total visits, and conversion rate.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
			}),
			endpoint: '/reports/dashboard-stats',
			cache: { key: 'report_dashboard', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentaffiliate_report_dashboard_chart',
			title: 'Get Dashboard Chart Data',
			description:
				'Get chart data for the affiliate dashboard showing referral and visit trends over time. Useful for visualizing affiliate program performance.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				group_by: z
					.enum(['day', 'week', 'month'])
					.optional()
					.describe('Grouping interval (default: day)'),
			}),
			endpoint: '/reports/dashboard-chart-stats',
		}),

		getTool(client, {
			name: 'fluentaffiliate_report_commerce',
			title: 'Get Commerce Reports',
			description:
				'Get commerce-specific reports for the affiliate program including revenue attributed to affiliates, top-performing affiliates, and product-level affiliate performance.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				provider: z.string().optional().describe('Filter by commerce provider'),
			}),
			endpoint: '/reports/commerce-reports',
		}),
	]
}
