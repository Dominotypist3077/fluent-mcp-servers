# Fluent MCP Servers — Open Source Collection

Open-source MCP (Model Context Protocol) servers for the [Fluent WordPress ecosystem](https://wpmanageninja.com/) by WPManageNinja.

Connect your AI agents (Claude, Cursor, Codex, Windsurf) to FluentCRM, FluentCart, Fluent Support, Fluent Boards, Fluent Community, and FluentAffiliate via the standard MCP protocol.

## Servers

| Server | Plugin | Tools | Status |
|--------|--------|-------|--------|
| [fluent-support-mcp](./fluent-support-mcp) | Fluent Support | 51 | Ready |
| [fluent-crm-mcp](./fluent-crm-mcp) | FluentCRM | 40 | Ready |
| [fluent-boards-mcp](./fluent-boards-mcp) | Fluent Boards | 30 | Ready |
| [fluent-community-mcp](./fluent-community-mcp) | Fluent Community | 30 | Ready |
| [fluent-affiliate-mcp](./fluent-affiliate-mcp) | FluentAffiliate | 24 | Ready |
| **Total** | | **175** | |

**Note**: For FluentCart, we recommend the excellent [fluentcart-mcp](https://github.com/vcode-sh/fchub-plugins) by vcode.sh (279 tools).

## Quick Start

Each server follows the same pattern:

### 1. Prerequisites

- WordPress site with the corresponding Fluent plugin installed
- WordPress Application Password ([how to create](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/))
- Node.js >= 18

### 2. Install

```bash
# Clone this repo
git clone https://github.com/carlosrodera/fluent-mcp-servers.git
cd fluent-mcp-servers

# Build the server you need
cd fluent-support-mcp
npm install && npm run build
```

### 3. Configure

Set environment variables:

```bash
export FLUENTSUPPORT_URL="https://your-wordpress-site.com"
export FLUENTSUPPORT_USERNAME="your-wp-username"
export FLUENTSUPPORT_APP_PASSWORD="your-application-password"
```

### 4. Connect to Claude Code

```bash
claude mcp add fluentsupport -- node /path/to/fluent-support-mcp/dist/index.js
```

### 5. Connect to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fluentsupport": {
      "command": "node",
      "args": ["/path/to/fluent-support-mcp/dist/index.js"],
      "env": {
        "FLUENTSUPPORT_URL": "https://your-wordpress-site.com",
        "FLUENTSUPPORT_USERNAME": "your-wp-username",
        "FLUENTSUPPORT_APP_PASSWORD": "your-application-password"
      }
    }
  }
}
```

## Architecture

All servers share the same architecture:

```
src/
  index.ts              CLI entry point (stdio transport)
  server.ts             MCP server (static + dynamic modes)
  cache.ts              In-memory TTL cache
  config/
    types.ts            Configuration types
    resolver.ts         Env vars + config file resolution
  api/
    client.ts           HTTP client with Basic Auth
    errors.ts           Typed API errors
  tools/
    _factory.ts         Tool creation helpers (GET/POST/PUT/DELETE)
    dynamic.ts          3 meta-tools for dynamic mode
    index.ts            Tool aggregator
    *.ts                Tool modules by domain
```

### Dynamic Mode

Each server supports dynamic mode for reduced token usage:

```bash
node dist/index.js --mode dynamic
```

In dynamic mode, only 3 meta-tools are loaded instead of all tools:
- `search_tools` — Find tools by keyword
- `describe_tools` — Get full schema for specific tools
- `execute_tool` — Execute a discovered tool

This reduces context window usage by ~96%.

## Authentication

All servers use WordPress Application Passwords (built into WordPress since 5.6). No additional plugins required.

Each server needs 3 environment variables:
- `{PREFIX}_URL` — Your WordPress site URL
- `{PREFIX}_USERNAME` — WordPress username
- `{PREFIX}_APP_PASSWORD` — Application Password

## Contributing

Contributions welcome! To add tools or fix endpoints:

1. Fork the repo
2. Create a branch
3. Add/fix tools in `src/tools/`
4. Build and test: `npm run build`
5. Submit a PR

## License

MIT

## Credits

Built with the [Anthropic MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk).

Inspired by the work of:
- [fchub.co](https://fchub.co) — FluentCart MCP (279 tools)
- [danieliser](https://github.com/danieliser) — FluentBoards MCP reference
- [netflyapp](https://github.com/netflyapp) — FluentCRM MCP reference
