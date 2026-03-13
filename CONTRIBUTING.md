# Contributing

Thanks for your interest in contributing to the ReScript VSCode extension.

## Repo Structure

```
.
├── client // Language Client. VSCode UI
│   └── src
│       ├── extension.ts // Language Client entry point
│       └── commands/ // Command implementations
├── shared // Shared utilities
│   └── src
│       ├── findBinary.ts // Binary resolution
│       └── projectRoots.ts // Project root detection
├── grammars // TextMate grammar files
├── package.json // The extension manifest
└── snippets.json // Code snippets
```

## Install Dependencies

- Run `npm install` at the root. This will also install the npm modules for the `client` folder.

## Build & Run

- `npm run compile` to compile TypeScript. You don't need this if you're developing in VSCode — the watch task runs automatically.
- `npm run bundle` to create a production bundle.

## Test

- Open VS Code to the project root.
- Switch to the Debug viewlet (command palette -> View: Show Run and Debug).
- Select `Launch Client` from the drop down, launch it (green arrow).
- In the Extension Development Host instance that opens, make sure you have `rescript.settings.lspCommand` configured in your workspace settings pointing to a `rescript lsp` binary.
- Open a `.res` file and try various features.

## Change the Grammar

The _real_ source of truth for our grammar is at https://github.com/rescript-lang/rescript-sublime. We port that `sublime-syntax` grammar over to this weaker TextMate language grammar for VSCode and the rest.

- Modify `grammars/rescript.tmLanguage.json`.

For more grammar inspirations, check:

- [TypeScript's grammar](https://github.com/microsoft/TypeScript-TmLanguage/blob/a771bc4e79deeae81a01d988a273e300290d0072/TypeScript.YAML-tmLanguage)
- [Writing a TextMate Grammar: Some Lessons Learned](https://www.apeth.com/nonblog/stories/textmatebundle.html)

## Snippets

Snippets are also synced from https://github.com/rescript-lang/rescript-sublime. VSCode snippets docs [here](https://code.visualstudio.com/api/references/contribution-points#contributes.snippets).

## Architecture

This extension is a thin LSP client. All language intelligence (hover, completion, diagnostics, formatting, etc.) is provided by the external `rescript lsp` command, which is part of the ReScript compiler. The extension spawns it as a child process using stdio transport.

The extension auto-resolves the `rescript` binary from `node_modules`, or users can configure an explicit command via `rescript.settings.lspCommand`.
