import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { deleteTool, getTool, postTool, type ToolDefinition } from './_factory.js'

export function referralTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_referral_list',
			title: 'List Referrals',
			description:
				'List all referrals with optional filtering by affiliate, status, type, and date range. Returns referral details including commission amounts and associated orders.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search referrals'),
				affiliate_id: z.number().optional().describe('Filter by affiliate ID'),
				status: z
					.enum(['pending', 'approved', 'rejected', 'paid'])
					.optional()
					.describe('Filter by referral status'),
				type: z.string().optional().describe('Filter by referral type (e.g. sale, lead)'),
				start_date: z.string().optional().describe('Filter from date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('Filter to date (YYYY-MM-DD)'),
				sort_by: z.string().optional().describe('Sort field: id, created_at, amount (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/referrals',
		}),

		getTool(client, {
			name: 'fluentaffiliate_referral_get',
			title: 'Get Referral',
			description:
				'Get detailed information about a single referral including the associated affiliate, order reference, commission amount, and status.',
			schema: z.object({
				referral_id: z.number().describe('Referral ID'),
			}),
			endpoint: '/referrals/:referral_id',
		}),

		postTool(client, {
			name: 'fluentaffiliate_referral_create',
			title: 'Create Referral',
			description:
				'Manually create a new referral record. Useful for crediting affiliates for offline sales or custom referral scenarios.',
			schema: z.object({
				affiliate_id: z.number().describe('Affiliate ID to credit (required)'),
				amount: z.number().describe('Referral commission amount (required)'),
				description: z.string().optional().describe('Description of the referral'),
				reference: z.string().optional().describe('Order or transaction reference ID'),
				type: z
					.enum(['sale', 'lead', 'opt-in'])
					.optional()
					.describe('Referral type (default: sale)'),
				status: z
					.enum(['pending', 'approved', 'rejected'])
					.optional()
					.describe('Referral status (default: pending)'),
				currency: z.string().optional().describe('Currency code (e.g. EUR, USD)'),
			}),
			endpoint: '/referrals',
		}),

		deleteTool(client, {
			name: 'fluentaffiliate_referral_delete',
			title: 'Delete Referral',
			description:
				'Permanently delete a referral record. This cannot be undone. The affiliate earnings will be adjusted accordingly.',
			schema: z.object({
				referral_id: z.number().describe('Referral ID to delete'),
			}),
			endpoint: '/referrals/:referral_id',
		}),
	]
}
