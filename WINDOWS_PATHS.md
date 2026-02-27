Windows Path Discovery for RayBridge (Phase 1)

This document records Windows-specific paths and artifacts identified during Phase 1 research. It is meant to guide Phase 2 implementation and should be updated as soon as exact locations are confirmed on a real Windows machine with Raycast installed.

Key goals addressed:
- Locate Raycast Windows installation paths
- Identify the Extensions directory (Raycast extensions) and its structure
- Locate the OAuth token database and determine encryption status
- Test and document the database encryption approach (SQLCipher or alternative)
- Find where credentials (encryption keys, tokens) are stored in Windows

Note: All paths below use Windows-friendly environment variables (e.g. %APPDATA%, %LOCALAPPDATA%). Replace with concrete values after verification on a target machine.

1) Raycast Windows Installation Locations
- Check these common install locations first (all are user- or system-wide install targets):
  - %LOCALAPPDATA%\Programs\Raycast
  - %APPDATA%\Raycast
  - %PROGRAMFILES%\Raycast
  - C:\Users\<User>\AppData\Local\Raycast
  
- Observations to record (after verification):
  - Actual root path where Raycast binaries/executables live
  - Whether there is a per-user vs. per-machine installation
  - Any subfolders that contain the Raycast executable or resources

2) Extensions Directory (Raycast extensions on Windows)
- Windows equivalent of macOS ~/.config/raycast/extensions/
- Potential candidate locations to search:
  - %APPDATA%\\Raycast\\extensions
  - %LOCALAPPDATA%\\Raycast\\extensions
  - C:\Users\\<User>\\AppData\\Local\\Raycast\\extensions
  - C:\Users\\<User>\\AppData\\Roaming\\Raycast\\extensions
  
- Discovery approach (Phase 1):
  - Recursively scan each candidate for folders containing a package.json
  - Validate that package.json includes a tools array/code that describes extension tools
  - Document exact path structure once discovered (e.g., extensions/<ext-id>/package.json or extensions/<ext-name>/<version>/package.json)

- Example structure to expect (illustrative):
  - %APPDATA%\\Raycast\\extensions\\com.example.extension\\package.json
  - The package.json should include a top-level "tools" array describing the available tools.

3) OAuth Token Database (Windows)
- macOS path mapped to Windows investigation targets:
  - macOS: ~/Library/Application Support/com.raycast.macos/raycast-enc.sqlite
  - Windows candidates to inspect:
    - %APPDATA%\\Raycast\\raycast-enc.sqlite
    - %LOCALAPPDATA%\\Raycast\\raycast-enc.sqlite
    - C:\Users\\<User>\\AppData\\Local\\Raycast\\raycast-enc.sqlite
    - C:\Users\\<User>\\AppData\\Roaming\\Raycast\\raycast-enc.sqlite
  
- How to test encryption status (Phase 1):
  - Start sqlcipher.exe against the database to see if it opens
  - Try: PRAGMA key = 'test-key'; .tables
  - If it asks for a password or fails, note the exact error to determine encryption status

- Documentation outcome:
  - Whether the database is SQLCipher-encrypted
  - If encrypted, record the likely key storage mechanism (see Credential Storage below)

4) Credential Storage (Windows)
- Windows Credential Manager is the primary target for credentials used by Raycast on Windows.
- PowerShell approach (to verify):
  - Get-StoredCredential -Target "Raycast*"  (requires CredentialManager module)
  - Observe entries to understand what is stored (passwords, tokens, or keys) and how they are protected
- Documentation outcome:
  - Where the encryption key is stored (Credential Manager, local file, or other)
  - Any known prefixes used by Raycast for its Credential targets

5) Extension Directory Structure (confirmed) and Tool Discovery
- Expected root: a directory containing extension folders; each extension has a package.json.
- package.json typically includes a tools array describing the available actions/tools.
- Note: Some extensions may ship with nested versions or per-extension subdirectories; capture the exact layout once verified.

6) Verification/Test Commands (Phase 1 guidance)
- Search for possible paths from PowerShell (example commands):
  - Get-ChildItem -Path "$env:APPDATA\\Raycast\\extensions" -Recurse -Filter "package.json" | Select-Object FullName
  - Get-ChildItem -Path "$env:LOCALAPPDATA\\Raycast\\extensions" -Recurse -Filter "package.json" | Select-Object FullName
- Quick SQLite test (if sqlcipher.exe is available):
  - sqlcipher.exe "%APPDATA%\\Raycast\\raycast-enc.sqlite"
  - PRAGMA key = 'test-key';
  - .tables

- Credential check (PowerShell):
  - Import-Module CredentialManagement
  - Get-StoredCredential -Target "Raycast*"

7) Deliverable and next steps
- Deliverable Phase 1: WINDOWS_PATHS.md with all discovered file paths, database location and encryption status, credential storage method, and extension directory structure
- Phase 2 will add platform.ts and credentials.ts abstractions and wire these into the core discovery/auth logic

Notes and caveats
- Do not hardcode Windows-specific paths in code; rely on cross-platform path joins and environment variables
- The exact database path and encryption method must be verified on a Windows machine with Raycast installed
- If Windows uses a different credential store (e.g., vendor-specific vaults), document it and adjust the credential abstraction accordingly

End of Phase 1 notes
