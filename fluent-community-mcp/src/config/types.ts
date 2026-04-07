import { homedir, platform } from 'node:os'
import { join } from 'node:path'

export interface FluentCommunityConfig {
	url: string
	username: string
	appPassword: string
	timeout?: number
}

export interface ResolvedConfig extends FluentCommunityConfig {
	apiBase: string
}

export function resolveApiUrl(config: FluentCommunityConfig): ResolvedConfig {
	const base = config.url.replace(/\/+$/, '')
	const apiBase = `${base}/wp-json/fluent-community/v2`
	return {
		...config,
		apiBase,
	}
}

export function getConfigDir(): string {
	const os = platform()
	if (os === 'win32') {
		return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'fluent-community-mcp')
	}
	return join(
		process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'),
		'fluent-community-mcp',
	)
}

export function getConfigPath(): string {
	return join(getConfigDir(), 'config.json')
}
