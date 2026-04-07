import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function visitTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_visit_list',
			title: 'List Visits',
			description:
				'List affiliate link visits/clicks with optional filtering by affiliate, date range, and pagination. Shows referral URL, landing page, IP (if stored), and conversion status.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				affiliate_id: z.number().optional().describe('Filter by affiliate ID'),
				start_date: z.string().optional().describe('Filter from date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('Filter to date (YYYY-MM-DD)'),
				search: z.string().optional().describe('Search visits'),
				sort_by: z.string().optional().describe('Sort field (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/visits',
		}),
	]
}
