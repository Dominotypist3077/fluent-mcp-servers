import { readFileSync } from 'node:fs'
import { type FluentCommunityConfig, getConfigPath } from './types.js'

interface ConfigFile {
	url?: string
	username?: string
	appPassword?: string
	timeout?: number
}

function fromEnv(): FluentCommunityConfig | undefined {
	const url = process.env.FLUENTCOMMUNITY_URL
	const username = process.env.FLUENTCOMMUNITY_USERNAME
	const appPassword = process.env.FLUENTCOMMUNITY_APP_PASSWORD
	const timeout = process.env.FLUENTCOMMUNITY_TIMEOUT

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

function fromFile(): FluentCommunityConfig | undefined {
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

export function resolveConfig(): FluentCommunityConfig {
	const config = fromEnv() ?? fromFile()

	if (!config) {
		throw new Error(
			'Fluent Community MCP server is not configured.\n\n' +
				'Set environment variables:\n' +
				'  FLUENTCOMMUNITY_URL          Your WordPress site URL\n' +
				'  FLUENTCOMMUNITY_USERNAME     WordPress username\n' +
				'  FLUENTCOMMUNITY_APP_PASSWORD WordPress Application Password\n',
		)
	}

	return config
}
