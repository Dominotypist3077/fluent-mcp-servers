#!/usr/bin/env node

import type { ToolsetMode } from './server.js'

const args = process.argv.slice(2)

if (args.includes('--version') || args.includes('-v')) {
	console.log('1.0.0')
	process.exit(0)
}

if (args.includes('--help') || args.includes('-h')) {
	console.log(`
fluent-boards-mcp — MCP server for the Fluent Boards REST API

Usage:
  fluent-boards-mcp              Start the MCP server (stdio transport)
  fluent-boards-mcp --version    Show version
  fluent-boards-mcp --help       Show this help

Options:
  --mode <static|dynamic>     Toolset mode (default: static)
                              static  = all tools registered individually
                              dynamic = 3 meta-tools (search, describe, execute)

Environment variables:
  FLUENTBOARDS_URL              WordPress site URL (e.g. https://my.site.com)
  FLUENTBOARDS_USERNAME         WordPress username
  FLUENTBOARDS_APP_PASSWORD     WordPress Application Password
  FLUENTBOARDS_TIMEOUT          Request timeout in ms (default: 30000)
`)
	process.exit(0)
}

function getFlag(name: string, fallback: string): string {
	const prefix = `--${name}=`
	const idx = args.findIndex((a) => a.startsWith(prefix) || a === `--${name}`)
	if (idx === -1) return fallback
	const arg = args[idx]!
	if (arg.startsWith(prefix)) return arg.slice(prefix.length)
	return args[idx + 1] ?? fallback
}

const mode = getFlag('mode', 'static') as ToolsetMode

const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js')
const { createServer } = await import('./server.js')

const server = createServer(mode)
const transport = new StdioServerTransport()
await server.connect(transport)
