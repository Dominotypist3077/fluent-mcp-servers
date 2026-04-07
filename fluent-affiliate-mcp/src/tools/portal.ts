import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { getTool, type ToolDefinition } from './_factory.js'

export function portalTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_portal_stats',
			title: 'Get Portal Stats',
			description:
				'Get affiliate portal statistics for the authenticated user: their total earnings, unpaid balance, referral count, visit count, and conversion rate.',
			schema: z.object({
				affiliate_id: z.number().optional().describe('Affiliate ID (admin can query any affiliate)'),
			}),
			endpoint: '/portal/stats',
		}),

		getTool(client, {
			name: 'fluentaffiliate_portal_referrals',
			title: 'Get Portal Referrals',
			description:
				'Get the referral list from the affiliate portal perspective. Shows the affiliate their own referrals with status, amounts, and dates.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				status: z
					.enum(['pending', 'approved', 'rejected', 'paid'])
					.optional()
					.describe('Filter by referral status'),
				affiliate_id: z.number().optional().describe('Affiliate ID (admin can query any affiliate)'),
			}),
			endpoint: '/portal/referrals',
		}),

		getTool(client, {
			name: 'fluentaffiliate_portal_transactions',
			title: 'Get Portal Transactions',
			description:
				'Get payout transactions from the affiliate portal perspective. Shows the affiliate their payment history including amounts, dates, and payment methods.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				affiliate_id: z.number().optional().describe('Affiliate ID (admin can query any affiliate)'),
			}),
			endpoint: '/portal/transactions',
		}),
	]
}
