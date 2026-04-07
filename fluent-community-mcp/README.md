# Fluent Community MCP Server

MCP server for the [Fluent Community](https://fluentcommunity.co/) WordPress community plugin. Provides AI agents with access to spaces, feeds/posts, comments, members, courses, notifications, analytics, and settings via the Fluent Community REST API.

## Prerequisites

- Node.js >= 22
- WordPress site with Fluent Community installed
- WordPress Application Password for authentication

## Installation

```bash
cd fluent-community-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
export FLUENTCOMMUNITY_URL="https://your-wordpress-site.com"
export FLUENTCOMMUNITY_USERNAME="your-wp-username"
export FLUENTCOMMUNITY_APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"
# Optional:
export FLUENTCOMMUNITY_TIMEOUT="30000"
```

### Config File (alternative)

Create `~/.config/fluent-community-mcp/config.json`:

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
    "fluent-community": {
      "command": "node",
      "args": ["/path/to/fluent-community-mcp/dist/index.js"],
      "env": {
        "FLUENTCOMMUNITY_URL": "https://your-wordpress-site.com",
        "FLUENTCOMMUNITY_USERNAME": "your-wp-username",
        "FLUENTCOMMUNITY_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
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
    "fluent-community": {
      "command": "node",
      "args": ["/path/to/fluent-community-mcp/dist/index.js", "--mode", "dynamic"],
      "env": { "..." : "..." }
    }
  }
}
```

In dynamic mode, the agent uses:
1. `fluentcommunity_search_tools` - discover available tools by keyword
2. `fluentcommunity_describe_tools` - get input schemas for specific tools
3. `fluentcommunity_execute_tool` - execute a tool by name with validated input

## Available Tools

### Spaces (5 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_space_list` | List spaces with filters (type, search) |
| `fluentcommunity_space_get` | Get single space details |
| `fluentcommunity_space_create` | Create new space (public/private/secret) |
| `fluentcommunity_space_update` | Update space properties |
| `fluentcommunity_space_delete` | Delete a space |

### Feeds/Posts (6 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_feed_list` | List posts with filters (space, author, status) |
| `fluentcommunity_feed_get` | Get single post details |
| `fluentcommunity_feed_create` | Create new post in a space |
| `fluentcommunity_feed_update` | Update post content/status |
| `fluentcommunity_feed_delete` | Delete a post |
| `fluentcommunity_feed_search` | Search posts by keyword |

### Comments (4 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_comment_list` | List comments for a post |
| `fluentcommunity_comment_create` | Add comment (supports threaded replies) |
| `fluentcommunity_comment_update` | Update comment content |
| `fluentcommunity_comment_delete` | Delete a comment |

### Members (5 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_member_list` | List community members |
| `fluentcommunity_member_get` | Get member profile |
| `fluentcommunity_member_add_to_space` | Add member to a space |
| `fluentcommunity_member_remove_from_space` | Remove member from a space |
| `fluentcommunity_member_update_role` | Change member role in a space |

### Courses (4 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_course_list` | List courses |
| `fluentcommunity_course_get` | Get course details |
| `fluentcommunity_course_enroll_user` | Enroll user in a course |
| `fluentcommunity_course_unenroll_user` | Unenroll user from a course |

### Notifications (2 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_notification_list` | List notifications (with read/unread filter) |
| `fluentcommunity_notification_mark_read` | Mark notifications as read |

### Analytics (2 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_analytics_stats` | Overall community statistics |
| `fluentcommunity_analytics_activity` | Activity trends over time |

### Settings (2 tools)
| Tool | Description |
|------|-------------|
| `fluentcommunity_settings_get` | Get community settings |
| `fluentcommunity_settings_update` | Update community settings |

**Total: 30 tools** (or 3 meta-tools in dynamic mode)

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
    _factory.ts       Tool creation helpers (getTool, postTool, putTool, patchTool, deleteTool, createTool)
    dynamic.ts        Dynamic mode (3 meta-tools: search, describe, execute)
    index.ts          Aggregates all tool modules
    spaces.ts         Space CRUD
    feeds.ts          Feed/post CRUD + search
    comments.ts       Comment CRUD
    members.ts        Member management + space roles
    courses.ts        Course enrollment
    notifications.ts  Notification management
    analytics.ts      Community stats and activity
    settings.ts       Configuration
```

## WordPress Application Password

1. In WordPress admin, go to **Users > Your Profile**
2. Scroll to **Application Passwords**
3. Enter a name (e.g., "Fluent Community MCP")
4. Click **Add New Application Password**
5. Copy the generated password (spaces are normal)

## API Base URL

All requests go to: `https://{site}/wp-json/fluent-community/v2/`

## License

MIT
