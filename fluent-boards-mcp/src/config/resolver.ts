import { readFileSync } from 'node:fs'
import { type FluentBoardsConfig, getConfigPath } from './types.js'

interface ConfigFile {
	url?: string
	username?: string
	appPassword?: string
	timeout?: number
}

function fromEnv(): FluentBoardsConfig | undefined {
	const url = process.env.FLUENTBOARDS_URL
	const username = process.env.FLUENTBOARDS_USERNAME
	const appPassword = process.env.FLUENTBOARDS_APP_PASSWORD
	const timeout = process.env.FLUENTBOARDS_TIMEOUT

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

function fromFile(): FluentBoardsConfig | undefined {
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

export function resolveConfig(): FluentBoardsConfig {
	const config = fromEnv() ?? fromFile()

	if (!config) {
		throw new Error(
			'Fluent Boards MCP server is not configured.\n\n' +
				'Set environment variables:\n' +
				'  FLUENTBOARDS_URL          Your WordPress site URL\n' +
				'  FLUENTBOARDS_USERNAME     WordPress username\n' +
				'  FLUENTBOARDS_APP_PASSWORD WordPress Application Password\n',
		)
	}

	return config
}
