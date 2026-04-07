import { z } from 'zod'
import type { FluentCommunityClient } from '../api/client.js'
import { TTL } from '../cache.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function courseTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcommunity_course_list',
			title: 'List Courses',
			description:
				'List all courses in the community. Courses are structured learning paths with lessons and optional quizzes. Supports pagination.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 20, max: 50)'),
				search: z.string().optional().describe('Search courses by title'),
				status: z
					.enum(['published', 'draft'])
					.optional()
					.describe('Filter by course status'),
			}),
			endpoint: '/courses',
			cache: { key: 'course_list', ttlMs: TTL.MEDIUM },
		}),

		getTool(client, {
			name: 'fluentcommunity_course_get',
			title: 'Get Course',
			description:
				'Get detailed information about a specific course including its lessons, enrollment count, progress tracking, and metadata.',
			schema: z.object({
				course_id: z.number().describe('Course ID'),
			}),
			endpoint: '/courses/:course_id',
		}),

		createTool(client, {
			name: 'fluentcommunity_course_enroll_user',
			title: 'Enroll User in Course',
			description:
				'Enroll a user in a course. The user will gain access to all published lessons within the course.',
			schema: z.object({
				course_id: z.number().describe('Course ID to enroll the user in'),
				user_id: z.number().describe('WordPress user ID to enroll'),
			}),
			handler: async (c, input) => {
				const courseId = input.course_id as number
				const userId = input.user_id as number
				const resp = await c.post(`/courses/${courseId}/enrollments`, { user_id: userId })
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcommunity_course_unenroll_user',
			title: 'Unenroll User from Course',
			description:
				'Remove a user\'s enrollment from a course. Their progress data may be retained but they will lose access to lessons.',
			annotations: { destructiveHint: true },
			schema: z.object({
				course_id: z.number().describe('Course ID'),
				user_id: z.number().describe('WordPress user ID to unenroll'),
			}),
			handler: async (c, input) => {
				const courseId = input.course_id as number
				const userId = input.user_id as number
				const resp = await c.delete(`/courses/${courseId}/enrollments/${userId}`)
				return resp.data
			},
		}),
	]
}
