import { homedir, platform } from 'node:os'
import { join } from 'node:path'

export interface FluentAffiliateConfig {
	url: string
	username: string
	appPassword: string
	timeout?: number
}

export interface ResolvedConfig extends FluentAffiliateConfig {
	apiBase: string
}

export function resolveApiUrl(config: FluentAffiliateConfig): ResolvedConfig {
	const base = config.url.replace(/\/+$/, '')
	const apiBase = `${base}/wp-json/fluent-affiliate/v2`
	return {
		...config,
		apiBase,
	}
}

export function getConfigDir(): string {
	const os = platform()
	if (os === 'win32') {
		return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'fluent-affiliate-mcp')
	}
	return join(
		process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'),
		'fluent-affiliate-mcp',
	)
}

export function getConfigPath(): string {
	return join(getConfigDir(), 'config.json')
}
