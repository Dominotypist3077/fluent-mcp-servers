# FluentCRM MCP Server

MCP server for the [FluentCRM](https://fluentcrm.com/) WordPress email marketing and CRM plugin. Provides AI agents with full access to contacts, tags, lists, campaigns, sequences, automations, templates, reports, and webhooks via the FluentCRM REST API.

## Prerequisites

- Node.js >= 22
- WordPress site with FluentCRM (+ Pro) installed
- WordPress Application Password for authentication

## Installation

```bash
cd fluent-crm-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
export FLUENTCRM_URL="https://your-wordpress-site.com"
export FLUENTCRM_USERNAME="your-wp-username"
export FLUENTCRM_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
# Optional:
export FLUENTCRM_TIMEOUT="30000"
```

### Config File (alternative)

Create `~/.config/fluent-crm-mcp/config.json`:

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
    "fluent-crm": {
      "command": "node",
      "args": ["/path/to/fluent-crm-mcp/dist/index.js"],
      "env": {
        "FLUENTCRM_URL": "https://your-wordpress-site.com",
        "FLUENTCRM_USERNAME": "your-wp-username",
        "FLUENTCRM_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
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
    "fluent-crm": {
      "command": "node",
      "args": ["/path/to/fluent-crm-mcp/dist/index.js", "--mode", "dynamic"],
      "env": { "..." : "..." }
    }
  }
}
```

In dynamic mode, the agent uses:
1. `fluentcrm_search_tools` - discover available tools by keyword
2. `fluentcrm_describe_tools` - get input schemas for specific tools
3. `fluentcrm_execute_tool` - execute a tool by name with validated input

## Available Tools

### Contacts (8 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_contact_list` | List contacts with filters (status, tags, lists, search) |
| `fluentcrm_contact_get` | Get single contact details |
| `fluentcrm_contact_get_by_email` | Look up contact by email address |
| `fluentcrm_contact_create` | Create new contact with tags/lists |
| `fluentcrm_contact_update` | Update contact fields |
| `fluentcrm_contact_delete` | Delete a contact |
| `fluentcrm_contact_add_tags` | Add tags to a contact |
| `fluentcrm_contact_remove_tags` | Remove tags from a contact |

### Tags (5 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_tag_list` | List all tags |
| `fluentcrm_tag_create` | Create tag |
| `fluentcrm_tag_update` | Update tag |
| `fluentcrm_tag_delete` | Delete tag |
| `fluentcrm_tag_attach_to_contact` | Attach tag to multiple contacts |

### Lists (5 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_list_list` | List all mailing lists |
| `fluentcrm_list_create` | Create list |
| `fluentcrm_list_update` | Update list |
| `fluentcrm_list_delete` | Delete list |
| `fluentcrm_list_attach_contact` | Add contacts to a list |

### Campaigns (6 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_campaign_list` | List campaigns with status filter |
| `fluentcrm_campaign_get` | Get campaign details and stats |
| `fluentcrm_campaign_create` | Create draft campaign |
| `fluentcrm_campaign_schedule` | Schedule campaign for sending |
| `fluentcrm_campaign_pause` | Pause sending campaign |
| `fluentcrm_campaign_resume` | Resume paused campaign |

### Templates (3 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_template_list` | List email templates |
| `fluentcrm_template_get` | Get template details |
| `fluentcrm_template_create` | Create email template |

### Sequences (4 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_sequence_list` | List email sequences |
| `fluentcrm_sequence_get` | Get sequence details |
| `fluentcrm_sequence_add_subscriber` | Add contacts to sequence |
| `fluentcrm_sequence_remove_subscriber` | Remove contacts from sequence |

### Automations/Funnels (4 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_funnel_list` | List automation funnels |
| `fluentcrm_funnel_get` | Get funnel details |
| `fluentcrm_funnel_create` | Create automation funnel |
| `fluentcrm_funnel_trigger` | Manually trigger funnel for contact |

### Reports (3 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_report_dashboard` | Dashboard stats (contacts, emails, rates) |
| `fluentcrm_report_subscribers_growth` | Subscriber growth trends |
| `fluentcrm_report_campaign_stats` | Campaign performance stats |

### Webhooks (2 tools)
| Tool | Description |
|------|-------------|
| `fluentcrm_webhook_list` | List incoming webhooks |
| `fluentcrm_webhook_create` | Create incoming webhook |

**Total: 40 tools** (or 3 meta-tools in dynamic mode)

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
    _factory.ts       Tool creation helpers (getTool, postTool, putTool, deleteTool, createTool)
    dynamic.ts        Dynamic mode (3 meta-tools: search, describe, execute)
    index.ts          Aggregates all tool modules
    contacts.ts       Contact/subscriber CRUD + tags
    tags.ts           Tag management
    lists.ts          Mailing list management
    campaigns.ts      Email campaigns
    templates.ts      Email templates
    sequences.ts      Email sequences (Pro)
    funnels.ts        Automation funnels
    reports.ts        Dashboard and analytics
    webhooks.ts       Incoming webhooks
```

## API Base URL

All requests go to: `https://{site}/wp-json/fluent-crm/v2/`

## License

MIT
