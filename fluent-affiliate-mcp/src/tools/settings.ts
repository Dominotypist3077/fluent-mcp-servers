import { z } from 'zod'
import type { FluentAffiliateClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function settingsTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentaffiliate_settings_referral_config',
			title: 'Get Referral Configuration',
			description:
				'Get the current referral configuration including commission rates, referral types, cookie duration, and tracking settings.',
			schema: z.object({}),
			endpoint: '/settings/referral-config',
			cache: { key: 'settings_referral', ttlMs: TTL.MEDIUM },
		}),

		createTool(client, {
			name: 'fluentaffiliate_settings_update_referral_config',
			title: 'Update Referral Configuration',
			description:
				'Update referral configuration settings such as default commission rate, commission type (percentage or flat), cookie duration, and tracking preferences.',
			annotations: { idempotentHint: true },
			schema: z.object({
				commission_type: z
					.enum(['percentage', 'flat'])
					.optional()
					.describe('Commission type: percentage of sale or flat amount'),
				commission_rate: z.number().optional().describe('Default commission rate'),
				cookie_days: z.number().optional().describe('Referral cookie duration in days'),
				referral_type: z
					.enum(['sale', 'lead', 'opt-in'])
					.optional()
					.describe('Default referral type'),
				auto_approve: z
					.boolean()
					.optional()
					.describe('Whether to auto-approve new referrals'),
				min_payout: z.number().optional().describe('Minimum payout threshold amount'),
			}),
			handler: async (c, input) => {
				const resp = await c.post('/settings/referral-config', input as Record<string, unknown>)
				return resp.data
			},
		}),

		getTool(client, {
			name: 'fluentaffiliate_settings_email_config',
			title: 'Get Email Configuration',
			description:
				'Get the current email notification settings for the affiliate program: notification templates, triggers, and recipient configuration.',
			schema: z.object({}),
			endpoint: '/settings/email-config',
			cache: { key: 'settings_email', ttlMs: TTL.MEDIUM },
		}),
	]
}
