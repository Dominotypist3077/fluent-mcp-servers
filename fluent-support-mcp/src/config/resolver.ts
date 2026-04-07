import { readFileSync } from 'node:fs'
import { type FluentSupportConfig, getConfigPath } from './types.js'

interface ConfigFile {
	url?: string
	username?: string
	appPassword?: string
	timeout?: number
}

function fromEnv(): FluentSupportConfig | undefined {
	const url = process.env.FLUENTSUPPORT_URL
	const username = process.env.FLUENTSUPPORT_USERNAME
	const appPassword = process.env.FLUENTSUPPORT_APP_PASSWORD
	const timeout = process.env.FLUENTSUPPORT_TIMEOUT

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

function fromFile(): FluentSupportConfig | undefined {
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

export function resolveConfig(): FluentSupportConfig {
	const config = fromEnv() ?? fromFile()

	if (!config) {
		throw new Error(
			'Fluent Support MCP server is not configured.\n\n' +
				'Set environment variables:\n' +
				'  FLUENTSUPPORT_URL          Your WordPress site URL\n' +
				'  FLUENTSUPPORT_USERNAME     WordPress username\n' +
				'  FLUENTSUPPORT_APP_PASSWORD WordPress Application Password\n',
		)
	}

	return config
}
