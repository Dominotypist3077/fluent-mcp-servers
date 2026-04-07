import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function payoutTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_payout_list',
			title: 'List Payouts',
			description:
				'List all payout records with optional filtering by status, affiliate, and date range. Shows payout amounts, methods, and processing status.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search payouts'),
				affiliate_id: z.number().optional().describe('Filter by affiliate ID'),
				status: z.string().optional().describe('Filter by payout status (e.g. pending, completed, failed)'),
				start_date: z.string().optional().describe('Filter from date (YYYY-MM-DD)'),
				end_date: z.string().optional().describe('Filter to date (YYYY-MM-DD)'),
				sort_by: z.string().optional().describe('Sort field (default: id)'),
				sort_type: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/payouts',
		}),

		getTool(client, {
			name: 'fluentaffiliate_payout_get',
			title: 'Get Payout',
			description:
				'Get detailed information about a specific payout including the affiliate, amount, payment method, status, and associated transactions.',
			schema: z.object({
				payout_id: z.number().describe('Payout ID'),
			}),
			endpoint: '/payouts/:payout_id',
		}),

		createTool(client, {
			name: 'fluentaffiliate_payout_process',
			title: 'Process Payout',
			description:
				'Process a payout for one or more affiliates. This marks approved referrals as paid and creates a payout record. Provide affiliate IDs to include in the payout batch.',
			schema: z.object({
				affiliate_ids: z
					.array(z.number())
					.min(1)
					.describe('Array of affiliate IDs to process payouts for (required)'),
				payment_method: z.string().optional().describe('Payment method (e.g. paypal, bank_transfer, manual)'),
				notes: z.string().optional().describe('Internal notes for this payout batch'),
			}),
			handler: async (c, input) => {
				const resp = await c.post('/payouts/process-payout', input as Record<string, unknown>)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentaffiliate_payout_validate_config',
			title: 'Validate Payout Configuration',
			description:
				'Validate that the payout configuration is correctly set up before processing payouts. Checks payment method settings, minimum thresholds, and affiliate payment details.',
			annotations: { readOnlyHint: true, idempotentHint: true },
			schema: z.object({}),
			handler: async (c) => {
				const resp = await c.get('/payouts/validate-config')
				return resp.data
			},
		}),
	]
}
