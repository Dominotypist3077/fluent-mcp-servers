import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { createTool, deleteTool, getTool, postTool, putTool, type ToolDefinition } from './_factory.js'

export function feedTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_feed_list',
			title: 'List Feeds/Posts',
			description:
				'List community posts/feeds with optional filtering by space, author, and status. Supports pagination and search. Returns post content, author info, reactions, and comment counts.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
				space_id: z.number().optional().describe('Filter posts by space ID'),
				user_id: z.number().optional().describe('Filter posts by author user ID'),
				search: z.string().optional().describe('Search posts by content'),
				status: z
					.enum(['published', 'draft', 'pending', 'scheduled'])
					.optional()
					.describe('Filter by post status (default: published)'),
				sort_by: z
					.enum(['created_at', 'updated_at', 'comments_count', 'reactions_count'])
					.optional()
					.describe('Sort field (default: created_at)'),
				sort_order: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/feeds',
		}),

		getTool(client, {
			name: 'fluentcommunity_feed_get',
			title: 'Get Feed/Post',
			description:
				'Get detailed information about a single post including its full content, author, reactions, comments, and metadata.',
			schema: z.object({
				feed_id: z.number().describe('Post/feed ID'),
			}),
			endpoint: '/feeds/:feed_id',
		}),

		postTool(client, {
			name: 'fluentcommunity_feed_create',
			title: 'Create Feed/Post',
			description:
				'Create a new post/feed in a community space. Requires a space_id and message content. Posts can be published immediately or saved as drafts.',
			schema: z.object({
				space_id: z.number().describe('Space ID to post in (required)'),
				message: z.string().min(1).describe('Post content/body (required). Supports HTML formatting.'),
				title: z.string().optional().describe('Post title (optional)'),
				status: z
					.enum(['published', 'draft', 'pending', 'scheduled'])
					.optional()
					.describe('Post status (default: published)'),
				is_pinned: z.boolean().optional().describe('Pin the post to the top of the space feed'),
				comments_enabled: z.boolean().optional().describe('Enable/disable comments on this post'),
			}),
			endpoint: '/feeds',
		}),

		putTool(client, {
			name: 'fluentcommunity_feed_update',
			title: 'Update Feed/Post',
			description:
				'Update an existing post. Can modify content, title, status, pinned state, or comment settings. Pass only the fields you want to change.',
			schema: z.object({
				feed_id: z.number().describe('Post/feed ID'),
				message: z.string().optional().describe('Updated post content/body'),
				title: z.string().optional().describe('Updated post title'),
				status: z
					.enum(['published', 'draft', 'pending', 'scheduled'])
					.optional()
					.describe('Post status'),
				is_pinned: z.boolean().optional().describe('Pin or unpin the post'),
				comments_enabled: z.boolean().optional().describe('Enable/disable comments'),
			}),
			endpoint: '/feeds/:feed_id',
		}),

		deleteTool(client, {
			name: 'fluentcommunity_feed_delete',
			title: 'Delete Feed/Post',
			description:
				'Permanently delete a post and all its associated comments. This action cannot be undone.',
			schema: z.object({
				feed_id: z.number().describe('Post/feed ID to delete'),
			}),
			endpoint: '/feeds/:feed_id',
		}),

		createTool(client, {
			name: 'fluentcommunity_feed_search',
			title: 'Search Feeds/Posts',
			description:
				'Search across all community posts by keyword. Returns matching posts with relevance ranking. More targeted than feed_list with search parameter.',
			annotations: { readOnlyHint: true, idempotentHint: true },
			schema: z.object({
				search: z.string().min(1).describe('Search query (required)'),
				space_id: z.number().optional().describe('Limit search to a specific space'),
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
			}),
			handler: async (c, input) => {
				const { search, space_id, page, per_page } = input as {
					search: string
					space_id?: number
					page?: number
					per_page?: number
				}
				const params: Record<string, unknown> = { search }
				if (space_id) params.space_id = space_id
				if (page) params.page = page
				if (per_page) params.per_page = per_page
				const resp = await c.get('/feeds', params)
				return resp.data
			},
		}),
	]
}
