import { IS_WINDOWS } from './platform'

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

class WindowsCredentials implements CredentialProvider {
  async getEncryptionKey(): Promise<string> {
    try {
      const wincred = require('wincred')
      return new Promise<string>((resolve, reject) => {
        // API may differ depending on the package; adapt as needed
        ;(wincred as any).getCredential('Raycast', (err: any, cred: any) => {
          if (err) return reject(err)
          resolve(cred && cred.password ? cred.password : '')
        })
      })
    } catch (err: any) {
      throw new Error('Windows Credential retrieval not available: ' + (err?.message ?? String(err)))
    }
  }
  async storeToken(_key: string, _token: any): Promise<void> {
    throw new Error('Windows credential storage not implemented yet')
  }
  async retrieveToken(_key: string): Promise<any> {
    throw new Error('Windows credential retrieval not implemented yet')
  }
}

export function getCredentialProvider(): CredentialProvider {
  return (IS_WINDOWS ? new WindowsCredentials() : new MacOSCredentials()) as CredentialProvider
}
