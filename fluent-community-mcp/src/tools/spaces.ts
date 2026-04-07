import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function spaceTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_space_list',
			title: 'List Spaces',
			description:
				'List all community spaces (groups/forums). Spaces are the main containers for posts and discussions. Supports pagination and search.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
				search: z.string().optional().describe('Search spaces by title'),
				type: z
					.enum(['community', 'course'])
					.optional()
					.describe('Filter by space type: community or course'),
			}),
			endpoint: '/spaces',
			cache: { key: 'space_list', ttlMs: TTL.MEDIUM },
		}),

		getTool(client, {
			name: 'fluentcommunity_space_get',
			title: 'Get Space',
			description:
				'Get detailed information about a specific space including its settings, member count, privacy level, and description.',
			schema: z.object({
				space_id: z.number().describe('Space ID'),
			}),
			endpoint: '/spaces/:space_id',
		}),

		postTool(client, {
			name: 'fluentcommunity_space_create',
			title: 'Create Space',
			description:
				'Create a new community space. Spaces can be public (anyone can join), private (invite-only), or secret (hidden from non-members).',
			schema: z.object({
				title: z.string().min(1).describe('Space name (required)'),
				description: z.string().optional().describe('Space description'),
				privacy: z
					.enum(['public', 'private', 'secret'])
					.optional()
					.describe('Privacy level (default: public)'),
				space_type: z
					.enum(['community', 'course'])
					.optional()
					.describe('Space type (default: community)'),
				status: z
					.enum(['active', 'draft'])
					.optional()
					.describe('Space status (default: active)'),
			}),
			endpoint: '/spaces',
			invalidates: ['space_list'],
		}),

		putTool(client, {
			name: 'fluentcommunity_space_update',
			title: 'Update Space',
			description:
				'Update space properties such as title, description, privacy level, or status. Pass only the fields you want to change.',
			schema: z.object({
				space_id: z.number().describe('Space ID'),
				title: z.string().optional().describe('Space name'),
				description: z.string().optional().describe('Space description'),
				privacy: z
					.enum(['public', 'private', 'secret'])
					.optional()
					.describe('Privacy level'),
				status: z
					.enum(['active', 'draft'])
					.optional()
					.describe('Space status'),
			}),
			endpoint: '/spaces/:space_id',
			invalidates: ['space_list'],
		}),

		deleteTool(client, {
			name: 'fluentcommunity_space_delete',
			title: 'Delete Space',
			description:
				'Permanently delete a space. This will remove all posts, comments, and member associations within the space. This action cannot be undone.',
			schema: z.object({
				space_id: z.number().describe('Space ID to delete'),
			}),
			endpoint: '/spaces/:space_id',
			invalidates: ['space_list'],
		}),
	]
}
