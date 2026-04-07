import { z } from 'zod'
import type { FluentSupportClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function reportTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentsupport_report_overall_stats',
			title: 'Get Overall Stats',
			description:
				'Get overall support statistics: total tickets, open tickets, closed tickets, average response time, and resolution time.',
			schema: z.object({}),
			endpoint: '/reports/stats',
			cache: { key: 'report_overall', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentsupport_report_ticket_growth',
			title: 'Get Ticket Growth',
			description:
				'Get ticket creation trends over time. Shows how many tickets were created per day, week, or month in the given date range.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				group_by: z
					.enum(['day', 'week', 'month'])
					.optional()
					.describe('Grouping interval (default: day)'),
			}),
			endpoint: '/reports/tickets-growth',
		}),

		getTool(client, {
			name: 'fluentsupport_report_resolve_stats',
			title: 'Get Resolution Stats',
			description:
				'Get ticket resolution statistics: average time to resolve, resolution rate, and breakdown by priority.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
			}),
			endpoint: '/reports/tickets-resolve-growth',
		}),

		getTool(client, {
			name: 'fluentsupport_report_response_stats',
			title: 'Get Response Stats',
			description:
				'Get response time statistics: average first response time, average response time, and response count breakdown.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
			}),
			endpoint: '/reports/response-growth',
		}),

		getTool(client, {
			name: 'fluentsupport_report_agent_stats',
			title: 'Get Agent Performance Stats',
			description:
				'Get per-agent performance metrics: tickets handled, average response time, resolution count, and satisfaction scores.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				agent_id: z.number().optional().describe('Filter by specific agent ID'),
			}),
			endpoint: '/reports/agents-summary',
		}),

		getTool(client, {
			name: 'fluentsupport_report_personal_stats',
			title: 'Get Personal Stats',
			description:
				'Get personal support stats for the authenticated agent: your tickets, response times, and resolution metrics.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
			}),
			endpoint: '/my-reports/my-summary',
		}),
	]
}
