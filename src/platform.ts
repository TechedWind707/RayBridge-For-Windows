import path from 'path'
import os from 'os'

export const IS_WINDOWS = process.platform === 'win32'
export const IS_MACOS = process.platform === 'darwin'

/**
 * Where things live on each OS.
 *
 * Windows (checked against Raycast for Windows 2.5.x):
 *   - extensions:  %USERPROFILE%\.config\raycast\extensions  (one folder per extension, each with package.json + tools/*.js)
 *   - Raycast data: %LOCALAPPDATA%\Raycast  (its own encrypted .db files; we only WATCH this folder, we don't read it)
 *   - our config:   %USERPROFILE%\.config\raybridge  (tools.json, preferences.json, storage/, support/)
 *
 * NOTE: an earlier version pointed at ".config/raycast-x", which doesn't exist,
 * so discovery found zero extensions. That was the main "nothing works" bug.
 */
export function getPlatformPaths(): { extensionsDir: string; configDir: string; databasePath: string; supportDir: string } {
  const configDir = path.join(os.homedir(), '.config', 'raybridge')
  if (IS_WINDOWS) {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    return {
      extensionsDir: path.join(os.homedir(), '.config', 'raycast', 'extensions'),
      configDir,
      // Only used so the watcher can reload when Raycast's data changes.
      databasePath: path.join(localAppData, 'Raycast', 'main.db'),
      // Per-extension scratch folder exposed as environment.supportPath
      supportDir: path.join(configDir, 'support'),
    }
  }
  return {
    extensionsDir: path.join(os.homedir(), '.config', 'raycast', 'extensions'),
    configDir,
    databasePath: path.join(os.homedir(), 'Library', 'Application Support', 'com.raycast.macos', 'raycast-enc.sqlite'),
    supportDir: path.join(os.homedir(), 'Library', 'Application Support', 'com.raycast.macos', 'extensions'),
  }
}
