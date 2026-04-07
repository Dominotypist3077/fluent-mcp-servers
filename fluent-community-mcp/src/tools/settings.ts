import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { getTool, putTool, type ToolDefinition } from './_factory.js'

export function settingsTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_settings_get',
			title: 'Get Community Settings',
			description:
				'Get Fluent Community configuration settings: general settings, registration options, email notifications, storage configuration, and authentication settings.',
			schema: z.object({
				group: z
					.string()
					.optional()
					.describe('Settings group to retrieve (e.g., "general", "email", "auth", "storage")'),
			}),
			endpoint: '/settings',
			cache: { key: 'settings_general', ttlMs: TTL.LONG },
		}),

		putTool(client, {
			name: 'fluentcommunity_settings_update',
			title: 'Update Community Settings',
			description:
				'Update Fluent Community configuration settings. Pass a settings group and the key-value pairs to update. Only provided fields will be changed.',
			schema: z.object({
				group: z
					.string()
					.optional()
					.describe('Settings group to update (e.g., "general", "email", "auth", "storage")'),
				settings: z
					.record(z.string(), z.unknown())
					.describe('Key-value pairs of settings to update'),
			}),
			endpoint: '/settings',
			invalidates: ['settings_general'],
		}),
	]
}
