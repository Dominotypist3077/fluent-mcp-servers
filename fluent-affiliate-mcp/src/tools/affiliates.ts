import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, deleteTool, getTool, patchTool, postTool, type ToolDefinition } from './_factory.js'

export function affiliateTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_affiliate_list',
			title: 'List Affiliates',
			description:
				'List all affiliates with optional filtering by status, search, and pagination. Returns affiliate profiles including earnings, referral counts, and status.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search affiliates by name or email'),
				status: z
					.enum(['active', 'pending', 'rejected', 'blocked'])
					.optional()
					.describe('Filter by affiliate status'),
				sort_by: z
					.string()
					.optional()
					.describe('Sort field: id, created_at, earnings (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/affiliates',
			cache: { key: 'affiliate_list', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentaffiliate_affiliate_get',
			title: 'Get Affiliate',
			description:
				'Get detailed information about a single affiliate including their profile, earnings summary, referral stats, payout history, and visit data.',
			schema: z.object({
				affiliate_id: z.number().describe('Affiliate ID'),
			}),
			endpoint: '/affiliates/:affiliate_id',
		}),

		postTool(client, {
			name: 'fluentaffiliate_affiliate_create',
			title: 'Create Affiliate',
			description:
				'Create a new affiliate. Requires a WordPress user ID or email. The affiliate will be associated with the given user account.',
			schema: z.object({
				user_id: z.number().optional().describe('WordPress user ID to associate as affiliate'),
				email: z.string().optional().describe('Email address (used to find or create WP user)'),
				first_name: z.string().optional().describe('Affiliate first name'),
				last_name: z.string().optional().describe('Affiliate last name'),
				payment_email: z.string().optional().describe('PayPal or payment email address'),
				status: z
					.enum(['active', 'pending', 'rejected', 'blocked'])
					.optional()
					.describe('Initial status (default: pending)'),
				referral_url: z.string().optional().describe('Custom referral URL slug'),
			}),
			endpoint: '/affiliates',
			invalidates: ['affiliate_list'],
		}),

		createTool(client, {
			name: 'fluentaffiliate_affiliate_update',
			title: 'Update Affiliate',
			description:
				'Update affiliate profile fields such as payment email, status, or referral URL. Pass only the fields you want to change.',
			annotations: { idempotentHint: true },
			schema: z.object({
				affiliate_id: z.number().describe('Affiliate ID'),
				first_name: z.string().optional().describe('First name'),
				last_name: z.string().optional().describe('Last name'),
				payment_email: z.string().optional().describe('Payment email address'),
				status: z
					.enum(['active', 'pending', 'rejected', 'blocked'])
					.optional()
					.describe('Affiliate status'),
				referral_url: z.string().optional().describe('Custom referral URL slug'),
			}),
			handler: async (c, input) => {
				const affiliateId = input.affiliate_id as number
				const { affiliate_id, ...changes } = input
				const resp = await c.patch(`/affiliates/${affiliateId}`, changes)
				return resp.data
			},
		}),

		deleteTool(client, {
			name: 'fluentaffiliate_affiliate_delete',
			title: 'Delete Affiliate',
			description:
				'Permanently delete an affiliate. This removes the affiliate record but does not delete the WordPress user account. Existing referrals may be affected.',
			schema: z.object({
				affiliate_id: z.number().describe('Affiliate ID to delete'),
			}),
			endpoint: '/affiliates/:affiliate_id',
			invalidates: ['affiliate_list'],
		}),

		createTool(client, {
			name: 'fluentaffiliate_affiliate_update_status',
			title: 'Update Affiliate Status',
			description:
				'Change the status of an affiliate (approve, reject, block, or reactivate). Use this for affiliate application management.',
			annotations: { idempotentHint: true },
			schema: z.object({
				affiliate_id: z.number().describe('Affiliate ID'),
				status: z
					.enum(['active', 'pending', 'rejected', 'blocked'])
					.describe('New status for the affiliate'),
			}),
			handler: async (c, input) => {
				const affiliateId = input.affiliate_id as number
				const status = input.status as string
				const resp = await c.patch(`/affiliates/${affiliateId}`, { status })
				return resp.data
			},
		}),
	]
}
