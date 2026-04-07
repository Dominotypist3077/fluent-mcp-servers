import type { FluentCrmClient } from '../api/client.js'
import type { ToolDefinition } from './_factory.js'
import { campaignTools } from './campaigns.js'
import { contactTools } from './contacts.js'
import { funnelTools } from './funnels.js'
import { listTools } from './lists.js'
import { reportTools } from './reports.js'
import { sequenceTools } from './sequences.js'
import { tagTools } from './tags.js'
import { templateTools } from './templates.js'
import { webhookTools } from './webhooks.js'

export function createAllTools(client: FluentCrmClient): ToolDefinition[] {
	return [
		...contactTools(client),
		...tagTools(client),
		...listTools(client),
		...campaignTools(client),
		...templateTools(client),
		...sequenceTools(client),
		...funnelTools(client),
		...reportTools(client),
		...webhookTools(client),
	]
}
