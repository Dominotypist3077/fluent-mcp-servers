import { readFileSync } from 'node:fs'
import { type FluentAffiliateConfig, getConfigPath } from './types.js'

interface ConfigFile {
	url?: string
	username?: string
	appPassword?: string
	timeout?: number
}

function fromEnv(): FluentAffiliateConfig | undefined {
	const url = process.env.FLUENTAFFILIATE_URL
	const username = process.env.FLUENTAFFILIATE_USERNAME
	const appPassword = process.env.FLUENTAFFILIATE_APP_PASSWORD
	const timeout = process.env.FLUENTAFFILIATE_TIMEOUT

	if (url && username && appPassword) {
		return {
			url,
			username,
			appPassword,
			timeout: timeout ? Number.parseInt(timeout, 10) : undefined,
		}
	}
	return undefined
}

function fromFile(): FluentAffiliateConfig | undefined {
	try {
		const raw = readFileSync(getConfigPath(), 'utf-8')
		const parsed = JSON.parse(raw) as ConfigFile
		if (parsed.url && parsed.username && parsed.appPassword) {
			return {
				url: parsed.url,
				username: parsed.username,
				appPassword: parsed.appPassword,
				timeout: parsed.timeout,
			}
		}
	} catch {
		// Config file doesn't exist or is invalid — that's fine
	}
	return undefined
}

export function resolveConfig(): FluentAffiliateConfig {
	const config = fromEnv() ?? fromFile()

	if (!config) {
		throw new Error(
			'FluentAffiliate MCP server is not configured.\n\n' +
				'Set environment variables:\n' +
				'  FLUENTAFFILIATE_URL          Your WordPress site URL\n' +
				'  FLUENTAFFILIATE_USERNAME     WordPress username\n' +
				'  FLUENTAFFILIATE_APP_PASSWORD WordPress Application Password\n',
		)
	}

	return config
}
