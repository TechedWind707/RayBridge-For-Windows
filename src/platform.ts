import path from 'path'
import os from 'os'

export const IS_WINDOWS = process.platform === 'win32'
export const IS_MACOS = process.platform === 'darwin'

export function getPlatformPaths(): { extensionsDir: string; configDir: string; databasePath: string } {
  if (IS_WINDOWS) {
    return {
      extensionsDir: path.join(os.homedir(), '.config', 'raycast-x', 'extensions'),
      configDir: path.join(os.homedir(), '.config', 'raybridge'),
      databasePath: path.join(os.homedir(), '.config', 'raycast-x', 'raycast-enc.sqlite'),
    }
  } else {
    return {
      extensionsDir: path.join(os.homedir(), '.config', 'raycast', 'extensions'),
      configDir: path.join(os.homedir(), '.config', 'raybridge'),
      databasePath: path.join(os.homedir(), 'Library', 'Application Support', 'com.raycast.macos', 'raycast-enc.sqlite'),
    }
  }
}
