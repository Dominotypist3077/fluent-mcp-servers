import type { FluentSupportClient } from '../api/client.js'
import type { ToolDefinition } from './_factory.js'
import { activityTools } from './activities.js'
import { agentTools } from './agents.js'
import { customerTools } from './customers.js'
import { reportTools } from './reports.js'
import { savedReplyTools } from './saved-replies.js'
import { settingsTools } from './settings.js'
import { ticketTools } from './tickets.js'
import { workflowTools } from './workflows.js'

export function createAllTools(client: FluentSupportClient): ToolDefinition[] {
	return [
		...ticketTools(client),
		...customerTools(client),
		...agentTools(client),
		...reportTools(client),
		...workflowTools(client),
		...savedReplyTools(client),
		...settingsTools(client),
		...activityTools(client),
	]
}
