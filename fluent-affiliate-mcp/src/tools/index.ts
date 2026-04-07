import type { FluentAffiliateClient } from '../api/client.js'
import type { ToolDefinition } from './_factory.js'
import { affiliateTools } from './affiliates.js'
import { payoutTools } from './payouts.js'
import { portalTools } from './portal.js'
import { referralTools } from './referrals.js'
import { reportTools } from './reports.js'
import { settingsTools } from './settings.js'
import { visitTools } from './visits.js'

export function createAllTools(client: FluentAffiliateClient): ToolDefinition[] {
	return [
		...affiliateTools(client),
		...referralTools(client),
		...payoutTools(client),
		...visitTools(client),
		...reportTools(client),
		...settingsTools(client),
		...portalTools(client),
	]
}
