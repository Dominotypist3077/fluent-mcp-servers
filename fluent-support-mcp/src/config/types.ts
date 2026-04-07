import { homedir, platform } from 'node:os'
import { join } from 'node:path'

export interface FluentSupportConfig {
	url: string
	username: string
	appPassword: string
	timeout?: number
}

export interface ResolvedConfig extends FluentSupportConfig {
	apiBase: string
}

export function resolveApiUrl(config: FluentSupportConfig): ResolvedConfig {
	const base = config.url.replace(/\/+$/, '')
	const apiBase = `${base}/wp-json/fluent-support/v2`
	return {
		...config,
		apiBase,
	}
}

export function getConfigDir(): string {
	const os = platform()
	if (os === 'win32') {
		return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'fluent-support-mcp')
	}
	return join(
		process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'),
		'fluent-support-mcp',
	)
}

export function getConfigPath(): string {
	return join(getConfigDir(), 'config.json')
}
