import { z } from 'zod'
import type { FluentCrmClient } from '../api/client.js'
import { createTool, getTool, type ToolDefinition } from './_factory.js'

export function sequenceTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		getTool(client, {
			name: 'fluentcrm_sequence_list',
			title: 'List Sequences',
			description:
				'List all email sequences (Pro). Sequences are automated multi-step email drip campaigns sent on a schedule.',
			schema: z.object({
				page: z.number().optional().describe('Page number (default: 1)'),
				per_page: z.number().max(50).optional().describe('Results per page (default: 15, max: 50)'),
				search: z.string().optional().describe('Search sequences by title'),
			}),
			endpoint: '/sequences',
		}),

		getTool(client, {
			name: 'fluentcrm_sequence_get',
			title: 'Get Sequence',
			description:
				'Get detailed information about a specific sequence including its emails, delays, and subscriber count.',
			schema: z.object({
				id: z.number().describe('Sequence ID'),
			}),
			endpoint: '/sequences/:id',
		}),

		createTool(client, {
			name: 'fluentcrm_sequence_add_subscriber',
			title: 'Add Subscriber to Sequence',
			description:
				'Add one or more contacts to a sequence. They will start receiving the sequence emails from the beginning.',
			schema: z.object({
				sequence_id: z.number().describe('Sequence ID'),
				subscriber_ids: z.array(z.number()).min(1).describe('Array of contact/subscriber IDs to add'),
			}),
			handler: async (c, input) => {
				const seqId = input.sequence_id as number
				const subscriberIds = input.subscriber_ids as number[]
				const resp = await c.post(`/sequences/${seqId}/subscribers`, {
					subscriber_ids: subscriberIds,
				})
				return resp.data
			},
		}),

		createTool(client, {
			name: 'fluentcrm_sequence_remove_subscriber',
			title: 'Remove Subscriber from Sequence',
			description: 'Remove one or more contacts from a sequence. They will stop receiving further emails.',
			annotations: { destructiveHint: true },
			schema: z.object({
				sequence_id: z.number().describe('Sequence ID'),
				subscriber_ids: z.array(z.number()).min(1).describe('Array of contact/subscriber IDs to remove'),
			}),
			handler: async (c, input) => {
				const seqId = input.sequence_id as number
				const subscriberIds = input.subscriber_ids as number[]
				const resp = await c.delete(`/sequences/${seqId}/subscribers`, {
					subscriber_ids: subscriberIds,
				} as Record<string, unknown>)
				return resp.data
			},
		}),
	]
}
