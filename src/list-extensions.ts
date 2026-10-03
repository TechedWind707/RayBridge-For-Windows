/**
 * Quick check: which extensions/tools RayBridge can see, and which ones will
 * need a token you supply (OAuth) or won't work on Windows (macOS-only APIs).
 * Run:  bun run list
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { discoverExtensions } from "./discovery.js";
import { getPlatformPaths } from "./platform.js";

const { extensionsDir, configDir } = getPlatformPaths();
let prefs: Record<string, unknown> = {};
try { prefs = JSON.parse(await readFile(join(configDir, "preferences.json"), "utf-8")); } catch {}

async function scan(dir: string, re: RegExp) {
  try {
    for (const f of await readdir(join(dir, "tools"))) {
      if (f.endsWith(".js") && re.test(await readFile(join(dir, "tools", f), "utf-8"))) return true;
    }
  } catch {}
  return false;
}

const exts = await discoverExtensions();
console.log(`Extensions dir: ${extensionsDir}\nFound ${exts.length} extensions with AI tools\n`);
for (const e of exts.sort((a, b) => a.extensionName.localeCompare(b.extensionName))) {
  const oauth = await scan(e.extensionDir, /PKCEClient|OAuthService|withAccessToken/);
  const mac = await scan(e.extensionDir, /osascript|runAppleScript/);
  const hasToken = !!(prefs as any)[e.extensionName]?.accessToken || !!(prefs as any)[e.extensionName]?.personalAccessToken;
  const status = mac ? "mac-only parts" : oauth ? (hasToken ? "ok (your token)" : "needs token") : "ok";
  console.log(`${status.padEnd(16)} ${e.extensionName.padEnd(24)} ${e.tools.length} tools`);
}
