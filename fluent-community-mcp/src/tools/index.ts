import type { FluentCommunityClient } from '../api/client.js'
import type { ToolDefinition } from './_factory.js'
import { analyticsTools } from './analytics.js'
import { commentTools } from './comments.js'
import { courseTools } from './courses.js'
import { feedTools } from './feeds.js'
import { memberTools } from './members.js'
import { notificationTools } from './notifications.js'
import { settingsTools } from './settings.js'
import { spaceTools } from './spaces.js'

export function createAllTools(client: FluentCommunityClient): ToolDefinition[] {
	return [
		...spaceTools(client),
		...feedTools(client),
		...commentTools(client),
		...memberTools(client),
		...courseTools(client),
		...notificationTools(client),
		...analyticsTools(client),
		...settingsTools(client),
	]
}
