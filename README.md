<h1 align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=chenglou92.rescript-vscode">ReScript VSCode</a>
</h1>

<p align="center">The Official VSCode plugin for ReScript</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/1909539/101266821-790b1400-3707-11eb-8e9f-fb7e36e660e6.gif"/>
</p>

## Contents

- [Contents](#contents)
- [Prerequisite](#prerequisite)
- [Supported Themes](#supported-themes)
- [Features](#features)
- [Installation](#installation)
- [Commands](#commands)
- [Settings](#settings)
- [Tips \& Tricks](#tips--tricks)
  - [Hide generated files](#hide-generated-files)
- [Changelog](#changelog)
- [How to Contribute](#how-to-contribute)
- [License](#license)

## Prerequisite

You **must** have [ReScript](https://www.npmjs.com/package/rescript) with LSP support installed locally in your project. The extension delegates all language intelligence to the `rescript lsp` command.

## Supported Themes

Our highlighting works well with most popular VSCode themes, such as:

- Dark+ (default dark), Light+ (default light)
- Solarized Dark, Solarized Light
- Monokai Dimmed
- Tomorrow Night Blue
- [One Dark Pro](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme)

The only 2 themes we don't (and can't) support, due to their lack of coloring, are:

- Dark (Visual Studio), Light (Visual Studio)

> **Note**
> If your custom theme doesn't seem to highlight much (e.g. no colors for upper-case JSX tag, no distinction between module and variant), try one of the recommended themes to see if that's the problem. For more info, see [this post](https://github.com/rescript-lang/rescript-vscode/pull/8#issuecomment-764469070).

## Features

- Supports `.res`, `.resi`, `rescript.json` and the legacy config file `bsconfig.json`.
- Syntax highlighting.
- Formatting.
- Build diagnostics.
- Type hint hover.
- Jump to definition.
- Autocomplete.
- Find references.
- Rename.
- Inlay Hints.
- Signature help.
- Code lenses.
- Snippets to ease a few syntaxes:
  - `external` features such as `@bs.module` and `@bs.val`
  - `try`, `for`, etc.
- Folding, and [custom folding](https://code.visualstudio.com/docs/editor/codebasics#_folding) through `//#region` and `//#endregion`.

## Installation

Launch VS Code Quick Open (`Ctrl+P`), paste the following command, and press enter.

```
ext install chenglou92.rescript-vscode
```

The plugin activates on `.res` and `.resi` files.

## Commands

| Command                                                          | Description                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ReScript: Create an interface file for this implementation file  | Creates an interface file (`.resi`) for the current `.res` file, automatically filling in all types and values in the current file.                                                                                                                                                                   |
| ReScript: Open the compiled JS file for this implementation file | Opens the compiled JS file for the current ReScript file.                                                                                                                                                                                                                                             |
| ReScript: Switch implementation/interface                        | Switches between the implementation and interface file. If you're in a `.res` file, the command will open the corresponding `.resi` file (if it exists), and if you're in a `.resi` file the command will open the corresponding `.res` file. This can also be triggered with the keybinding `Alt+O`. |
| ReScript: Restart Language Server                                | Restarts the ReScript LSP server.                                                                                                                                                                                                                                                                     |
| ReScript: Start Build                                            | Starts the ReScript build watcher.                                                                                                                                                                                                                                                                    |
| ReScript: Paste as ReScript JSON.t                               | Converts JSON from the clipboard and pastes it as ReScript `JSON.t` format. Automatically handles indentation based on cursor position.                                                                                                                                                               |
| ReScript: Paste as ReScript JSX                                  | Converts vanilla JSX from the clipboard and pastes it as ReScript JSX format. Automatically handles indentation based on cursor position.                                                                                                                                                             |

## Settings

You'll find all ReScript specific settings under the scope `rescript.settings`.

| Setting                  | Description                                                                                                                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LSP Command              | Command and arguments to start the ReScript LSP server. Example: `["bun", "--bun", "/path/to/rescript.js", "lsp"]`. If not set, the extension auto-resolves `rescript` from `node_modules` and runs it with `lsp`. Configure via `rescript.settings.lspCommand`.                      |
| Initialization Options   | Additional initialization options passed to the ReScript LSP server as a JSON object (e.g. `{ "queue_debounce_ms": 50, "diagnostics_http": 12307 }`). Configure via `rescript.settings.initializationOptions`.                                                                       |
| Compile Status Indicator | Shows compile status in the status bar (Compiling, Errors, Warnings, Success). Toggle via `rescript.settings.compileStatus.enable`. Clicking in Error/Warning modes focuses the Problems view.                                                                                        |

**Default settings:**

```jsonc
// Command and arguments to start the ReScript LSP server. Auto-resolves from node_modules if not set.
"rescript.settings.lspCommand": null,

// Additional initialization options passed to the LSP server.
"rescript.settings.initializationOptions": {},

// Show compile status in the status bar (compiling/errors/warnings/success)
"rescript.settings.compileStatus.enable": true
```

## Tips & Tricks

### Hide generated files

You can configure VSCode to collapse the JavaScript files ReScript generates under its source ReScript file. This will "hide" the generated files in the VSCode file explorer, but still leaving them accessible by expanding the source ReScript file they belong to.

Open your VSCode settings and type:

```jsonc
"explorer.fileNesting.enabled": true,
"explorer.fileNesting.patterns": {
  "*.res": "${capture}.mjs, ${capture}.js, ${capture}.cmi, ${capture}.cmt, ${capture}.cmj",
  "*.resi": "${capture}.res"
},
```

This nests implementations under interfaces if they're present and nests all generated files under the main ReScript file. Adapt and tweak to your liking.

A screenshot of the result:

![Shows the end result in VSCode, with ReScript related files nested under eachother appropriately.](https://user-images.githubusercontent.com/1457626/168123647-400e2f09-31e3-45a2-b74b-190c7c207446.png)

## Changelog

See [CHANGELOG](CHANGELOG.md)

## How to Contribute

Read our [Contributing Guide](CONTRIBUTING.md)

## License

See the [LICENSE](./LICENSE.txt) file for details.
