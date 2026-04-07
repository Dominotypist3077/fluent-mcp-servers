import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function memberTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_member_list',
			title: 'List Members',
			description:
				'List community members with optional search and pagination. Shows member profiles, roles, and activity status.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
				search: z.string().optional().describe('Search members by name or email'),
				sort_by: z
					.enum(['display_name', 'created_at', 'last_activity'])
					.optional()
					.describe('Sort field (default: created_at)'),
				sort_order: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default: DESC)'),
			}),
			endpoint: '/members',
			cache: { key: 'member_list', ttlMs: TTL.SHORT },
		}),

		getTool(client, {
			name: 'fluentcommunity_member_get',
			title: 'Get Member',
			description:
				'Get detailed profile information about a specific community member including their activity, spaces, and role.',
			schema: z.object({
				user_id: z.number().describe('WordPress user ID'),
			}),
			endpoint: '/members/:user_id',
		}),

		createTool(client, {
			name: 'fluentcommunity_member_add_to_space',
			title: 'Add Member to Space',
			description:
				'Add a user to a community space. The user must be a WordPress user. You can optionally set their role within the space.',
			schema: z.object({
				space_id: z.number().describe('Space ID to add the member to'),
				user_id: z.number().describe('WordPress user ID to add'),
				role: z
					.enum(['member', 'moderator', 'admin'])
					.optional()
					.describe('Role within the space (default: member)'),
			}),
			handler: async (c, input) => {
				const spaceId = input.space_id as number
				const userId = input.user_id as number
				const role = input.role as string | undefined
				const body: Record<string, unknown> = { user_id: userId }
				if (role) body.role = role
				const resp = await c.post(`/spaces/${spaceId}/members`, body)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcommunity_member_remove_from_space',
			title: 'Remove Member from Space',
			description:
				'Remove a user from a community space. The user will lose access to the space content if it is private or secret.',
			annotations: { destructiveHint: true },
			schema: z.object({
				space_id: z.number().describe('Space ID to remove the member from'),
				user_id: z.number().describe('WordPress user ID to remove'),
			}),
			handler: async (c, input) => {
				const spaceId = input.space_id as number
				const userId = input.user_id as number
				const resp = await c.delete(`/spaces/${spaceId}/members/${userId}`)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcommunity_member_update_role',
			title: 'Update Member Role',
			description:
				'Change a member\'s role within a specific space. Roles control permissions: member (read/post), moderator (manage posts/comments), admin (full control).',
			annotations: { idempotentHint: true },
			schema: z.object({
				space_id: z.number().describe('Space ID'),
				user_id: z.number().describe('WordPress user ID'),
				role: z
					.enum(['member', 'moderator', 'admin'])
					.describe('New role for the member within this space'),
			}),
			handler: async (c, input) => {
				const spaceId = input.space_id as number
				const userId = input.user_id as number
				const role = input.role as string
				const resp = await c.put(`/spaces/${spaceId}/members/${userId}`, { role })
				return resp.data
			},
		}),
	]
}
