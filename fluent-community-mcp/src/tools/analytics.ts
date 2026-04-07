import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function analyticsTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_analytics_stats',
			title: 'Get Community Stats',
			description:
				'Get overall community statistics: total members, total spaces, total posts, total comments, active members, new sign-ups, and engagement metrics.',
			schema: z.object({
				period: z
					.enum(['7d', '30d', '90d', 'all'])
					.optional()
					.describe('Time period for stats (default: 30d)'),
			}),
			endpoint: '/analytics/stats',
			cache: { key: 'analytics_stats', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentcommunity_analytics_activity',
			title: 'Get Activity Analytics',
			description:
				'Get community activity trends over time: posts created, comments made, new members, and reactions. Useful for tracking engagement and growth.',
			schema: z.object({
				start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('End date (YYYY-MM-DD)'),
				group_by: z
					.enum(['day', 'week', 'month'])
					.optional()
					.describe('Grouping interval (default: day)'),
				space_id: z.number().optional().describe('Filter activity to a specific space'),
			}),
			endpoint: '/analytics/activity',
		}),
	]
}
