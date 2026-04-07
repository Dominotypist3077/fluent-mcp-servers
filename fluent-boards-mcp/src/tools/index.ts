import type { FluentBoardsClient } from '../api/client.js'
import type { ToolDefinition } from './_factory.js'
import { boardTools } from './boards.js'
import { commentTools } from './comments.js'
import { labelTools } from './labels.js'
import { memberTools } from './members.js'
import { stageTools } from './stages.js'
import { taskTools } from './tasks.js'

export function createAllTools(client: FluentBoardsClient): ToolDefinition[] {
	return [
		...boardTools(client),
		...taskTools(client),
		...stageTools(client),
		...labelTools(client),
		...commentTools(client),
		...memberTools(client),
	]
}
