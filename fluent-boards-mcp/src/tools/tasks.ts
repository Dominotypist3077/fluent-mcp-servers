import { z } from 'zod'
import type { FluentBoardsClient } from '../api/client.js'
import { createTool, deleteTool, getTool, type ToolDefinition } from './_factory.js'

export function taskTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentboards_task_list',
			title: 'List Tasks',
			description:
				'List all tasks for a specific board. Returns tasks across all stages with their status, priority, assignees, and metadata.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
			}),
			endpoint: '/projects/:board_id/tasks',
		}),

		getTool(client, {
			name: 'fluentboards_task_get',
			title: 'Get Task',
			description:
				'Get detailed information about a single task including its description, assignees, labels, subtasks, and activity history.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID'),
			}),
			endpoint: '/projects/:board_id/tasks/:task_id',
		}),

		createTool(client, {
			name: 'fluentboards_task_create',
			title: 'Create Task',
			description:
				'Create a new task on a board. Requires a title, board_id, and stage_id. Optionally set priority, CRM contact, or mark as template.',
			schema: z.object({
				board_id: z.number().describe('Board ID (required)'),
				title: z.string().min(1).describe('Task title (required)'),
				stage_id: z.number().describe('Stage ID to place the task in (required)'),
				priority: z
					.enum(['low', 'medium', 'high'])
					.optional()
					.describe('Task priority: low, medium, high'),
				description: z.string().optional().describe('Task description (HTML supported)'),
				due_at: z.string().optional().describe('Due date (YYYY-MM-DD or ISO 8601)'),
				crm_contact_id: z.number().optional().describe('FluentCRM contact ID to associate'),
			}),
			handler: async (c, input) => {
				const { board_id, title, stage_id, priority, description, due_at, crm_contact_id } =
					input as {
						board_id: number
						title: string
						stage_id: number
						priority?: string
						description?: string
						due_at?: string
						crm_contact_id?: number
					}
				const task: Record<string, unknown> = {
					title,
					board_id,
					stage_id,
				}
				if (priority) task.priority = priority
				if (description) task.description = description
				if (due_at) task.due_at = due_at
				if (crm_contact_id) task.crm_contact_id = crm_contact_id
				const resp = await c.post(`/projects/${board_id}/tasks`, { task })
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_task_update',
			title: 'Update Task',
			description:
				'Update a specific property of a task. Supported properties: title, description, status, priority, due_at, started_at, assignees, archived_at, last_completed_at, board_id, type, reminder_type, remind_at.',
			annotations: { idempotentHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID'),
				property: z
					.string()
					.describe(
						'Property name to update (e.g. title, description, status, priority, due_at, started_at, assignees, archived_at, last_completed_at)',
					),
				value: z.unknown().describe('New value for the property'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const taskId = input.task_id as number
				const property = input.property as string
				const value = input.value
				const resp = await c.put(`/projects/${boardId}/tasks/${taskId}`, {
					property,
					value: value as Record<string, unknown>,
				})
				return resp.data
			},
		}),

		deleteTool(client, {
			name: 'fluentboards_task_delete',
			title: 'Delete Task',
			description:
				'Permanently delete a task. This action cannot be undone. All subtasks, comments, and attachments will also be deleted.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID to delete'),
			}),
			endpoint: '/projects/:board_id/tasks/:task_id',
		}),

		createTool(client, {
			name: 'fluentboards_task_move_stage',
			title: 'Move Task to Stage',
			description:
				'Move a task to a different stage within the same board, or to a stage in a different board. Optionally set the position within the target stage.',
			schema: z.object({
				board_id: z.number().describe('Current board ID'),
				task_id: z.number().describe('Task ID to move'),
				new_stage_id: z.number().describe('Target stage ID'),
				new_index: z.number().optional().describe('Position within the target stage (0-based)'),
				new_board_id: z
					.number()
					.optional()
					.describe('Target board ID for cross-board moves (optional)'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const taskId = input.task_id as number
				const body: Record<string, unknown> = {
					newStageId: input.new_stage_id,
				}
				if (input.new_index !== undefined) body.newIndex = input.new_index
				if (input.new_board_id !== undefined) body.newBoardId = input.new_board_id
				const resp = await c.put(`/projects/${boardId}/tasks/${taskId}/move-task`, body)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_task_clone',
			title: 'Clone Task',
			description:
				'Create a copy of an existing task. Choose which elements to include: assignees, subtasks, labels, attachments, and comments.',
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID to clone'),
				title: z.string().min(1).describe('Title for the cloned task (required)'),
				stage_id: z.number().describe('Target stage ID for the cloned task (required)'),
				assignee: z.boolean().optional().describe('Include assignees (default: false)'),
				subtask: z.boolean().optional().describe('Include subtasks (default: false)'),
				label: z.boolean().optional().describe('Include labels (default: false)'),
				attachment: z.boolean().optional().describe('Include attachments (default: false)'),
				comment: z.boolean().optional().describe('Include comments (default: false)'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const taskId = input.task_id as number
				const body: Record<string, unknown> = {
					title: input.title,
					stage_id: input.stage_id,
					assignee: input.assignee ?? false,
					subtask: input.subtask ?? false,
					label: input.label ?? false,
					attachment: input.attachment ?? false,
					comment: input.comment ?? false,
				}
				const resp = await c.post(`/projects/${boardId}/tasks/${taskId}/clone-task`, body)
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentboards_task_close',
			title: 'Close Task',
			description:
				'Close (complete) a task by setting its status to "closed" and recording the completion timestamp.',
			annotations: { idempotentHint: true },
			schema: z.object({
				board_id: z.number().describe('Board ID'),
				task_id: z.number().describe('Task ID to close'),
			}),
			handler: async (c, input) => {
				const boardId = input.board_id as number
				const taskId = input.task_id as number
				const resp = await c.put(`/projects/${boardId}/tasks/${taskId}`, {
					property: 'status',
					value: 'closed',
				})
				return resp.data
			},
		}),
	]
}
