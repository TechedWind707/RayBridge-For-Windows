# RayBridge on Windows: status and workarounds

_Last checked: 2026-10-03 against Raycast for Windows 2.5.3, Bun 1.4.2, Node 24._

## Quick start

```powershell
npm i -g bun          # RayBridge runs on Bun
bun install
bun run list          # shows which extensions/tools RayBridge can see
bun run start         # MCP over stdio (for Claude Code / Claude Desktop)
bun run start:http    # MCP over HTTP on :3000 (the old MCP_HTTP=true form was macOS/Linux-only)
```

Current result on my machine: **31 extensions, 162 tools registered** (1 disabled in `tools.json`).

## What was wrong (and is now fixed)

| Problem | Effect | Fix |
|---|---|---|
| `platform.ts` pointed at `~/.config/raycast-x/extensions` (doesn't exist) | Found **0** extensions, so nothing worked | Now `~/.config/raycast/extensions`, where Raycast for Windows installs them |
| `environment.supportPath` hardcoded to `~/Library/Application Support/...` | Extensions that cache files crashed | Now `~/.config/raybridge/support/<extension>` (created on demand) |
| `LocalStorage` was a no-op | Extensions "forgot" everything between calls | File-backed: `~/.config/raybridge/storage/<extension>.json` |
| `Clipboard` was a no-op | "Copied to clipboard" tools did nothing | Uses `Set-Clipboard` / `Get-Clipboard` on Windows (`pbcopy`/`pbpaste` on macOS) |
| `getApplications()` scanned `/Applications` | Always empty on Windows | Lists Start Menu shortcuts |
| `start:http` used `MCP_HTTP=true ...` | Fails in PowerShell/cmd | Uses the `--http` flag |
| Watcher pointed at a non-existent DB path | Never reloaded on Raycast changes | Watches `%LOCALAPPDATA%\Raycast` |

Smoke-tested: `svgl` (fetch + clipboard), `todo-list`, `portfolio-tracker` all run.

## What still needs a workaround: OAuth extensions

Extensions that sign in through Raycast's own OAuth (GitHub Copilot, Google Calendar/Tasks/Workspace, Slack, Zoom, GitHub) keep their tokens inside Raycast's private, encrypted app data. RayBridge doesn't read that on Windows, and that's deliberate: it's Raycast's internal storage, not a public API.

**Workaround: give RayBridge your own token.** Create `~/.config/raybridge/preferences.json`:

```json
{
  "github": { "accessToken": "ghp_your_personal_access_token" },
  "slack":  { "accessToken": "xoxp-your-user-token" }
}
```

When an extension asks for its OAuth token, RayBridge now hands it this one (`accessToken`, `personalAccessToken` or `token` all work). This works for any API that accepts a plain bearer token:

- **GitHub:** a fine-grained personal access token (Settings → Developer settings).
- **Slack:** a user token from your own Slack app (api.slack.com/apps).
- **Zoom:** a server-to-server OAuth app token.
- **Google:** tokens expire after an hour, so this is a stopgap only. Google tools stay marked "needs token".

The same file also sets normal extension preferences (API keys etc.), keyed by extension name. It's reloaded automatically when you save it.

## Known limits (not fixing)

- **macOS-only extensions/tools** (AppleScript, `/Applications`, macOS paths): `downloads-manager`, `raycast-wallpaper`, `ticktick`, parts of `spotify-player` and `github`. Out of scope.
- **Raycast's own LocalStorage isn't shared.** RayBridge's storage is separate, so data you added inside the Raycast app (e.g. Portfolio Tracker positions) won't show up through RayBridge.
- **UI-only commands** (List/Form/Detail views) aren't tools, so they don't apply.
- `credentials.ts` (keytar-based) is unused scaffolding. It's safe to delete or leave.
