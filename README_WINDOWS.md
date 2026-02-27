# RayBridge Windows MVP

Overview
- Port of RayBridge (MCP server) to Windows to bridge Raycast extensions to Claude Desktop.
- This MVP focuses on safe Windows path handling, platform guards, and a non-blocking start when Windows-specific OAuth flow is not yet fully implemented.

Prerequisites
- Windows 10/11
- Raycast installed (Windows build)
- Bun installed (recommended) or Node.js with matching TS tooling
- Raycast extensions directory present in Windows user profile (see Phase 1 findings in WINDOWS_PATHS.md)
- Optional: Windows Credential Manager available if you plan to implement token storage

What this MVP does now
- Platform guards to avoid macOS-specific code on Windows
- Cross-platform path resolution via src/platform.ts
- Discovery wired to Windows extensions path via getPlatformPaths()
- Basic structure for Windows token loading (returns empty token map until Windows DB path is wired)
- Test harness ready to exercise discovery and token loading (test-discovery.ts)

How to test (step-by-step)
Notes
- This MVP intentionally doesn’t ship with a Windows DB decrypt path yet. Phase 3 will implement Windows Credential Manager-based key management and Windows-specific SQLCipher access when Phase 1 findings are confirmed.
- All file paths use cross-platform path joins; no hard-coded macOS paths are present in the new code.
