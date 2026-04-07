# Fluent Support MCP Server

MCP server for the [Fluent Support](https://fluentsupport.com/) WordPress helpdesk plugin. Provides AI agents with full access to tickets, customers, agents, workflows, saved replies, reports, and settings via the Fluent Support REST API.

## Prerequisites

- Node.js >= 22
- WordPress site with Fluent Support installed
- WordPress Application Password for authentication

## Installation

```bash
cd fluent-support-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
export FLUENTSUPPORT_URL="https://your-wordpress-site.com"
export FLUENTSUPPORT_USERNAME="your-wp-username"
export FLUENTSUPPORT_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
# Optional:
export FLUENTSUPPORT_TIMEOUT="30000"
```

### Config File (alternative)

Create `~/.config/fluent-support-mcp/config.json`:

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
    "fluent-support": {
      "command": "node",
      "args": ["/path/to/fluent-support-mcp/dist/index.js"],
      "env": {
        "FLUENTSUPPORT_URL": "https://your-wordpress-site.com",
        "FLUENTSUPPORT_USERNAME": "your-wp-username",
        "FLUENTSUPPORT_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
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
    "fluent-support": {
      "command": "node",
      "args": ["/path/to/fluent-support-mcp/dist/index.js", "--mode", "dynamic"],
      "env": { "..." : "..." }
    }
  }
}
```

In dynamic mode, the agent uses:
1. `fluentsupport_search_tools` - discover available tools by keyword
2. `fluentsupport_describe_tools` - get input schemas for specific tools
3. `fluentsupport_execute_tool` - execute a tool by name with validated input

## Available Tools

### Tickets (12 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_ticket_list` | List tickets with filters (status, priority, agent, customer) |
| `fluentsupport_ticket_get` | Get single ticket details |
| `fluentsupport_ticket_create` | Create new ticket |
| `fluentsupport_ticket_update` | Update ticket properties |
| `fluentsupport_ticket_reply` | Add response or internal note |
| `fluentsupport_ticket_close` | Close a ticket |
| `fluentsupport_ticket_reopen` | Reopen a closed ticket |
| `fluentsupport_ticket_delete` | Delete a ticket |
| `fluentsupport_ticket_bulk_actions` | Bulk close/reopen/delete/assign |
| `fluentsupport_ticket_responses` | List ticket conversation thread |
| `fluentsupport_ticket_add_tag` | Add tags to a ticket |
| `fluentsupport_ticket_remove_tag` | Remove a tag from a ticket |

### Customers (6 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_customer_list` | List customers with search |
| `fluentsupport_customer_get` | Get customer details |
| `fluentsupport_customer_create` | Create new customer |
| `fluentsupport_customer_update` | Update customer profile |
| `fluentsupport_customer_delete` | Delete a customer |
| `fluentsupport_customer_tickets` | List customer's tickets |

### Agents (5 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_agent_list` | List support agents |
| `fluentsupport_agent_get` | Get agent details |
| `fluentsupport_agent_create` | Add new agent |
| `fluentsupport_agent_update` | Update agent profile |
| `fluentsupport_agent_delete` | Remove an agent |

### Reports (6 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_report_overall_stats` | Overall support statistics |
| `fluentsupport_report_ticket_growth` | Ticket creation trends |
| `fluentsupport_report_resolve_stats` | Resolution statistics |
| `fluentsupport_report_response_stats` | Response time metrics |
| `fluentsupport_report_agent_stats` | Per-agent performance |
| `fluentsupport_report_personal_stats` | Authenticated agent stats |

### Workflows (5 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_workflow_list` | List automation workflows |
| `fluentsupport_workflow_get` | Get workflow details |
| `fluentsupport_workflow_create` | Create workflow |
| `fluentsupport_workflow_update` | Update workflow |
| `fluentsupport_workflow_delete` | Delete workflow |

### Saved Replies (5 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_saved_reply_list` | List reply templates |
| `fluentsupport_saved_reply_get` | Get template details |
| `fluentsupport_saved_reply_create` | Create template |
| `fluentsupport_saved_reply_update` | Update template |
| `fluentsupport_saved_reply_delete` | Delete template |

### Settings (11 tools)
| Tool | Description |
|------|-------------|
| `fluentsupport_tag_list` | List ticket tags |
| `fluentsupport_tag_create` | Create tag |
| `fluentsupport_tag_update` | Update tag |
| `fluentsupport_tag_delete` | Delete tag |
| `fluentsupport_product_list` | List products |
| `fluentsupport_product_create` | Create product |
| `fluentsupport_product_update` | Update product |
| `fluentsupport_product_delete` | Delete product |
| `fluentsupport_settings_get` | Get general settings |
| `fluentsupport_settings_mailboxes` | List mailboxes |

### Activities (1 tool)
| Tool | Description |
|------|-------------|
| `fluentsupport_activity_list` | List activity log entries |

**Total: 51 tools** (or 3 meta-tools in dynamic mode)

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
    tickets.ts        Ticket CRUD + responses + tags
    customers.ts      Customer management
    agents.ts         Agent/staff management
    reports.ts        Stats and analytics
    workflows.ts      Automation workflows
    saved-replies.ts  Reply templates
    settings.ts       Tags, products, configuration
    activities.ts     Activity log
```

## WordPress Application Password

1. In WordPress admin, go to **Users > Your Profile**
2. Scroll to **Application Passwords**
3. Enter a name (e.g., "Fluent Support MCP")
4. Click **Add New Application Password**
5. Copy the generated password (spaces are normal)

## API Base URL

All requests go to: `https://{site}/wp-json/fluent-support/v2/`

## License

MIT
