import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { getTool, postTool, type ToolDefinition } from './_factory.js'

export function templateTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_template_list',
			title: 'List Templates',
			description:
				'List all email templates. Templates provide reusable email layouts and designs for campaigns.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search templates by name'),
			}),
			endpoint: '/templates',
			cache: { key: 'template_list', ttlMs: TTL.MEDIUM },
		}),

		getTool(client, {
			name: 'fluentcrm_template_get',
			title: 'Get Template',
			description:
				'Get detailed information about a specific email template including its HTML body and design settings.',
			schema: z.object({
				id: z.number().describe('Template ID'),
			}),
			endpoint: '/templates/:id',
		}),

		postTool(client, {
			name: 'fluentcrm_template_create',
			title: 'Create Template',
			description:
				'Create a new email template with HTML content. Templates can be used across multiple campaigns.',
			schema: z.object({
				post_title: z.string().min(1).describe('Template name/title (required)'),
				post_content: z.string().min(1).describe('Template HTML content (required)'),
				post_excerpt: z.string().optional().describe('Template description/excerpt'),
				design_template: z
					.string()
					.optional()
					.describe('Design template type: classic, raw_classic, visual_builder'),
			}),
			endpoint: '/templates',
			invalidates: ['template_list'],
		}),
	]
}
