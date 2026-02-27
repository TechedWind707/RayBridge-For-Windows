import { IS_WINDOWS } from './platform'
import { randomBytes, createHash } from 'node:crypto'
try {
  // Lazy load keytar if available; on some environments this may fail gracefully
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  var keytar = require('keytar')
} catch {
  // will be undefined in environments where keytar isn't installed
  var keytar: any = undefined
}

export interface CredentialProvider {
  getEncryptionKey(): Promise<string>
  storeToken(key: string, token: any): Promise<void>
  retrieveToken(key: string): Promise<any>
}

class MacOSCredentials implements CredentialProvider {
  async getEncryptionKey(): Promise<string> {
    try {
      const { execSync } = require('child_process')
      const key = execSync(`security find-generic-password -s "Raycast" -a "raycast" -w`).toString().trim()
      return key
    } catch (err: any) {
      throw new Error('MacOS keychain access failed: ' + (err?.message ?? String(err)))
    }
  }
  async storeToken(_key: string, _token: any): Promise<void> {
    throw new Error('MacOS credential storage not implemented in this port')
  }
  async retrieveToken(_key: string): Promise<any> {
    throw new Error('MacOS credential retrieval not implemented in this port')
  }
}

const RAYCAST_SALT_WIN = 'yvkwWXzxPPBAqY2tmaKrB*DvYjjMaeEf'

class WindowsCredentials implements CredentialProvider {
  private static SERVICE = 'raybridge-raycast'
  private static KEY_ACCOUNT = 'RaycastDBKey'
  private static TOKEN_PREFIX = 'Token:'

  private ensureKeytar(): any {
    if (!keytar) {
      throw new Error('Windows credential store (keytar) is not available. Install the keytar package.')
    }
    return keytar
  }

  async getEncryptionKey(): Promise<string> {
    const kt = this.ensureKeytar()
    // Try to load a stored key; generate if missing
    let stored: string | null = await kt.getPassword(WindowsCredentials.SERVICE, WindowsCredentials.KEY_ACCOUNT)
    if (!stored) {
      // Generate a new 32-byte hex key
      const newKey = randomBytes(32).toString('hex')
      await kt.setPassword(WindowsCredentials.SERVICE, WindowsCredentials.KEY_ACCOUNT, newKey)
      stored = newKey
    }
    // Derive a passphrase from stored key + salt to mirror macOS flow
    const passphrase = createHash('sha256').update(stored + RAYCAST_SALT_WIN).digest('hex')
    return passphrase
  }

  async storeToken(key: string, token: any): Promise<void> {
    const kt = this.ensureKeytar()
    const account = WindowsCredentials.TOKEN_PREFIX + key
    await kt.setPassword(WindowsCredentials.SERVICE, account, JSON.stringify(token))
  }

  async retrieveToken(key: string): Promise<any> {
    const kt = this.ensureKeytar()
    const account = WindowsCredentials.TOKEN_PREFIX + key
    const raw = await kt.getPassword(WindowsCredentials.SERVICE, account)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
}

export function getCredentialProvider(): CredentialProvider {
  return (IS_WINDOWS ? new WindowsCredentials() : new MacOSCredentials()) as CredentialProvider
}
