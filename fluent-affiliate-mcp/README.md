# FluentAffiliate MCP Server

MCP server for the [FluentAffiliate](https://fluentaffiliate.com/) WordPress affiliate program plugin. Provides AI agents with full access to affiliates, referrals, payouts, visits, reports, settings, and portal data via the FluentAffiliate REST API.

> **Note**: This API is undocumented. Endpoints were discovered from the plugin source code (`app/Http/Routes/api.php` in the WordPress SVN). Some request/response formats may require adjustment based on the installed plugin version.

## Prerequisites

- Node.js >= 22
- WordPress site with FluentAffiliate Pro installed
- WordPress Application Password for authentication

## Installation

```bash
cd fluent-affiliate-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
export FLUENTAFFILIATE_URL="https://your-wordpress-site.com"
export FLUENTAFFILIATE_USERNAME="your-wp-username"
export FLUENTAFFILIATE_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
# Optional:
export FLUENTAFFILIATE_TIMEOUT="30000"
```

### Config File (alternative)

Create `~/.config/fluent-affiliate-mcp/config.json`:

```json
{
  "url": "https://your-wordpress-site.com",
  "username": "your-wp-username",
  "appPassword": "xxxx xxxx xxxx xxxx xxxx xxxx"
}
```

Environment variables take precedence over the config file.

## Usage

### Claude Desktop / Claude Code

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "fluent-affiliate": {
      "command": "node",
      "args": ["/path/to/fluent-affiliate-mcp/dist/index.js"],
      "env": {
        "FLUENTAFFILIATE_URL": "https://your-wordpress-site.com",
        "FLUENTAFFILIATE_USERNAME": "your-wp-username",
        "FLUENTAFFILIATE_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

### Dynamic Mode

Dynamic mode exposes only 3 meta-tools instead of all individual tools, reducing context window usage:

```json
{
  "mcpServers": {
    "fluent-affiliate": {
      "command": "node",
      "args": ["/path/to/fluent-affiliate-mcp/dist/index.js", "--mode", "dynamic"],
      "env": { "..." : "..." }
    }
  }
}
```

In dynamic mode, the agent uses:
1. `fluentaffiliate_search_tools` - discover available tools by keyword
2. `fluentaffiliate_describe_tools` - get input schemas for specific tools
3. `fluentaffiliate_execute_tool` - execute a tool by name with validated input

## Available Tools

### Affiliates (6 tools)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_affiliate_list` | List affiliates with filters (status, search) |
| `fluentaffiliate_affiliate_get` | Get single affiliate details |
| `fluentaffiliate_affiliate_create` | Create new affiliate |
| `fluentaffiliate_affiliate_update` | Update affiliate profile |
| `fluentaffiliate_affiliate_delete` | Delete an affiliate |
| `fluentaffiliate_affiliate_update_status` | Change affiliate status (approve/reject/block) |

### Referrals (4 tools)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_referral_list` | List referrals with filters |
| `fluentaffiliate_referral_get` | Get referral details |
| `fluentaffiliate_referral_create` | Create manual referral |
| `fluentaffiliate_referral_delete` | Delete a referral |

### Payouts (4 tools)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_payout_list` | List payout records |
| `fluentaffiliate_payout_get` | Get payout details |
| `fluentaffiliate_payout_process` | Process payouts for affiliates |
| `fluentaffiliate_payout_validate_config` | Validate payout configuration |

### Visits (1 tool)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_visit_list` | List affiliate link visits/clicks |

### Reports (3 tools)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_report_dashboard_stats` | Dashboard statistics overview |
| `fluentaffiliate_report_dashboard_chart` | Chart data for trends |
| `fluentaffiliate_report_commerce` | Commerce/revenue reports |

### Settings (3 tools)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_settings_referral_config` | Get referral configuration |
| `fluentaffiliate_settings_update_referral_config` | Update referral settings |
| `fluentaffiliate_settings_email_config` | Get email notification config |

### Portal (3 tools)
| Tool | Description |
|------|-------------|
| `fluentaffiliate_portal_stats` | Affiliate portal statistics |
| `fluentaffiliate_portal_referrals` | Portal referral list |
| `fluentaffiliate_portal_transactions` | Portal payout transactions |

**Total: 24 tools** (or 3 meta-tools in dynamic mode)

## Architecture

```
src/
  index.ts            Entry point (stdio transport, CLI flags)
  server.ts           MCP server creation (static + dynamic modes)
  cache.ts            In-memory TTL cache
  config/
    types.ts          Config interfaces and URL resolution
    resolver.ts       Env + file config resolution
  api/
    client.ts         HTTP client with Basic Auth
    errors.ts         Typed error classes
  tools/
    _factory.ts       Tool creation helpers (getTool, postTool, patchTool, deleteTool, createTool)
    dynamic.ts        Dynamic mode (3 meta-tools: search, describe, execute)
    index.ts          Aggregates all tool modules
    affiliates.ts     Affiliate CRUD + status management
    referrals.ts      Referral CRUD
    payouts.ts        Payout management + processing
    visits.ts         Visit/click tracking
    reports.ts        Dashboard stats, charts, commerce reports
    settings.ts       Referral config, email config
    portal.ts         Affiliate portal data
```

## API Base URL

All requests go to: `https://{site}/wp-json/fluent-affiliate/v2/`

## WordPress Application Password

1. In WordPress admin, go to **Users > Your Profile**
2. Scroll to **Application Passwords**
3. Enter a name (e.g., "FluentAffiliate MCP")
4. Click **Add New Application Password**
5. Copy the generated password (spaces are normal)

## License

MIT
