import { readFileSync } from 'node:fs'
import { type FluentCrmConfig, getConfigPath } from './types.js'

interface ConfigFile {
	url?: string
	username?: string
	appPassword?: string
	timeout?: number
}

function fromEnv(): FluentCrmConfig | undefined {
	const url = process.env.FLUENTCRM_URL
	const username = process.env.FLUENTCRM_USERNAME
	const appPassword = process.env.FLUENTCRM_APP_PASSWORD
	const timeout = process.env.FLUENTCRM_TIMEOUT

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

function fromFile(): FluentCrmConfig | undefined {
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

export function resolveConfig(): FluentCrmConfig {
	const config = fromEnv() ?? fromFile()

	if (!config) {
		throw new Error(
			'FluentCRM MCP server is not configured.\n\n' +
				'Set environment variables:\n' +
				'  FLUENTCRM_URL              Your WordPress site URL\n' +
				'  FLUENTCRM_USERNAME         WordPress username\n' +
				'  FLUENTCRM_APP_PASSWORD     WordPress Application Password\n',
		)
	}

	return config
}
