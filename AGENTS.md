# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

This is an experimental branch of the ReScript VSCode extension. The built-in TypeScript LSP server and native OCaml analysis binaries have been removed. Instead, the extension delegates all language intelligence to the `rescript lsp` command built into the ReScript compiler itself.

## Architecture

### Key Components

- **client/**: VSCode extension client (`client/src/extension.ts`) - handles UI, commands, and language client initialization. Spawns `rescript lsp` as a child process using stdio transport.
- **shared/**: Shared utilities for finding the `rescript` binary and project roots
- **grammars/**: TextMate grammar files for syntax highlighting
- **snippets.json**: Code snippets for common ReScript patterns

### Build System

The project uses:

- **esbuild**: For bundling the TypeScript client
- **npm**: For JavaScript/TypeScript dependencies
- **TypeScript**: For type checking the client code

## Development Commands

### Initial Setup

```bash
npm install                    # Install all dependencies including client
```

### Building

```bash
npm run compile               # Compile TypeScript
npm run bundle                # Bundle for production (esbuild)
```

### Development

```bash
npm run watch                 # Watch TypeScript compilation
```

### Code Quality

```bash
make format                   # Format JS/TS (prettier)
make checkformat              # Check formatting without modifying
```

### Running the Extension in Development

1. Open the project in VSCode
2. Press F5 to launch a new VSCode window (Extension Development Host)
3. In the test project, configure `.vscode/settings.json` with `rescript.settings.lspCommand` pointing to your `rescript lsp` binary
4. Open a ReScript file to activate the extension

## Key Files

### Configuration

- `package.json`: Extension manifest, commands, settings, and scripts
- `rescript.configuration.json`: Editor configuration for ReScript files
- `client/src/extension.ts`: Extension entry point and client initialization

### Settings

- `rescript.settings.lspCommand`: Command and arguments to start the LSP server (e.g. `["bun", "--bun", "/path/to/rescript.js", "lsp"]`). If not set, the extension auto-resolves `rescript` from `node_modules`.
- `rescript.settings.initializationOptions`: Free-form object passed as LSP initialization options (e.g. `{ "queue_debounce_ms": 50, "diagnostics_http": 12307 }`).
- `rescript.settings.compileStatus.enable`: Toggle compile status in the status bar.

### Language Features

All language features (hover, goto definition, find references, rename, autocomplete, formatting, diagnostics, etc.) are provided by the external `rescript lsp` server.

### Client-side Commands

- **Create interface**: Sends `textDocument/createInterface` request to the LSP server
- **Open compiled JS**: Sends `textDocument/openCompiled` request to the LSP server
- **Switch impl/intf**: Client-side file switching with `Alt+O`
- **Paste as ReScript JSON/JSX**: Pure client-side text transformations

## Project Structure Notes

- The extension supports both `.res` (implementation) and `.resi` (interface) files
- The LSP server is external — it runs as a child process spawned by the extension via stdio
- The `shared/src/findBinary.ts` module handles auto-resolution of the `rescript` binary from `node_modules`
