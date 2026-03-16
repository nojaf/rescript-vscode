import {
  workspace,
  ExtensionContext,
  commands,
  window,
  StatusBarAlignment,
  Uri,
  Range,
  Position,
  ViewColumn,
} from "vscode";
import { ThemeColor } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  State,
} from "vscode-languageclient/node";

import * as customCommands from "./commands";
import { findProjectRootOfFile } from "../../shared/src/projectRoots";
import { findBinary } from "../../shared/src/findBinary";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  let outputChannel = window.createOutputChannel(
    "ReScript Language Server",
    "rescript",
  );

  async function createLanguageClient(): Promise<LanguageClient | null> {
    const lspCommandSetting = workspace
      .getConfiguration("rescript.settings")
      .get<string[]>("lspCommand");

    let command: string;
    let args: string[];

    if (lspCommandSetting && lspCommandSetting.length > 0) {
      command = lspCommandSetting[0];
      args = lspCommandSetting.slice(1);
    } else {
      // Auto-resolve rescript from node_modules
      const projectRoot = getProjectRoot();
      const rescriptPath = await findBinary({
        projectRootPath: projectRoot,
        binary: "rescript",
      });
      if (!rescriptPath) {
        window.showErrorMessage(
          "Could not find rescript binary. Set rescript.settings.lspCommand in your workspace settings.",
        );
        return null;
      }
      command = rescriptPath;
      args = ["lsp"];
    }

    const serverOptions: ServerOptions = {
      command,
      args,
      options: {
        env: {
          ...process.env,
          OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4707",
          OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
        },
      },
    };

    const userInitOptions = workspace
      .getConfiguration("rescript.settings")
      .get<object>("initializationOptions", {});

    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: "file", language: "rescript" }],
      initializationOptions: {
        ...userInitOptions,
      },
      outputChannel,
      markdown: {
        isTrusted: true,
      },
    };

    const client = new LanguageClient(
      "ReScriptLSP",
      "ReScript Language Server",
      serverOptions,
      clientOptions,
    );

    return client;
  }

  function getProjectRoot(): string | null {
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
      return findProjectRootOfFile(activeEditor.document.uri.fsPath);
    }
    const folders = workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      return folders[0].uri.fsPath;
    }
    return null;
  }

  // Create the language client and start the client.
  const initialClient = await createLanguageClient();
  if (!initialClient) {
    return;
  }
  client = initialClient;

  let compilationStatusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Right,
  );
  context.subscriptions.push(compilationStatusBarItem);

  let compileStatusEnabled: boolean = workspace
    .getConfiguration("rescript.settings")
    .get<boolean>("compileStatus.enable", true);

  type ClientCompileStatus = {
    status: "compiling" | "success" | "error" | "warning";
    project: string;
    errorCount: number;
    warningCount: number;
  };
  const projectStatuses: Map<string, ClientCompileStatus> = new Map();

  const refreshCompilationStatusItem = () => {
    if (!compileStatusEnabled) {
      compilationStatusBarItem.hide();
      compilationStatusBarItem.tooltip = undefined;
      compilationStatusBarItem.backgroundColor = undefined;
      compilationStatusBarItem.command = undefined;
      return;
    }
    const entries = [...projectStatuses.values()];
    const compiling = entries.filter((e) => e.status === "compiling");
    const errors = entries.filter((e) => e.status === "error");
    const warnings = entries.filter((e) => e.status === "warning");

    if (compiling.length > 0) {
      compilationStatusBarItem.text = `$(loading~spin) ReScript`;
      compilationStatusBarItem.tooltip = compiling
        .map((e) => e.project)
        .join(", ");
      compilationStatusBarItem.backgroundColor = undefined;
      compilationStatusBarItem.command = undefined;
      compilationStatusBarItem.show();
      return;
    }

    if (errors.length > 0) {
      compilationStatusBarItem.text = `$(alert) ReScript: Failed`;
      compilationStatusBarItem.backgroundColor = new ThemeColor(
        "statusBarItem.errorBackground",
      );
      compilationStatusBarItem.command = "rescript-vscode.showProblems";
      const byProject = errors.map((e) => `${e.project} (${e.errorCount})`);
      compilationStatusBarItem.tooltip = `Failed: ${byProject.join(", ")}`;
      compilationStatusBarItem.show();
      return;
    }

    if (warnings.length > 0) {
      compilationStatusBarItem.text = `$(warning) ReScript: Warnings`;
      compilationStatusBarItem.backgroundColor = undefined;
      compilationStatusBarItem.color = new ThemeColor(
        "statusBarItem.warningBackground",
      );
      compilationStatusBarItem.command = "rescript-vscode.showProblems";
      const byProject = warnings.map((e) => `${e.project} (${e.warningCount})`);
      compilationStatusBarItem.tooltip = `Warnings: ${byProject.join(", ")}`;
      compilationStatusBarItem.show();
      return;
    }

    const successes = entries.filter((e) => e.status === "success");
    if (successes.length > 0) {
      compilationStatusBarItem.text = `$(check) ReScript: Ok`;
      compilationStatusBarItem.backgroundColor = undefined;
      compilationStatusBarItem.color = null;
      compilationStatusBarItem.command = undefined;
      const projects = successes.map((e) => e.project).join(", ");
      compilationStatusBarItem.tooltip = projects
        ? `Compilation Succeeded: ${projects}`
        : `Compilation Succeeded`;
      compilationStatusBarItem.show();
      return;
    }

    compilationStatusBarItem.hide();
    compilationStatusBarItem.tooltip = undefined;
    compilationStatusBarItem.backgroundColor = undefined;
    compilationStatusBarItem.command = undefined;
  };

  context.subscriptions.push(
    client.onDidChangeState(({ newState }) => {
      if (newState === State.Running) {
        context.subscriptions.push(
          client.onNotification(
            "rescript/compilationStatus",
            (payload: {
              project: string;
              projectRootPath: string;
              status: "compiling" | "success" | "error" | "warning";
              errorCount: number;
              warningCount: number;
            }) => {
              projectStatuses.set(payload.projectRootPath, {
                status: payload.status,
                project: payload.project,
                errorCount: payload.errorCount,
                warningCount: payload.warningCount,
              });
              refreshCompilationStatusItem();
            },
          ),
        );
      }
    }),
  );

  // Register custom commands
  commands.registerCommand("rescript-vscode.create_interface", () => {
    customCommands.createInterface(client);
  });

  commands.registerCommand("rescript-vscode.open_compiled", () => {
    customCommands.openCompiled(client);
  });

  commands.registerCommand("rescript-vscode.dump-server-state", async () => {
    try {
      const result = (await client.sendRequest("workspace/executeCommand", {
        command: "rescript/dumpServerState",
      })) as { content: string };

      const document = await workspace.openTextDocument({
        content: result.content,
        language: "json",
      });

      await window.showTextDocument(document, {
        viewColumn: ViewColumn.Beside,
        preview: false,
      });
    } catch (e) {
      outputChannel.appendLine(`Failed to dump server state: ${String(e)}`);
      window.showErrorMessage(
        "Failed to dump server state. See 'Output' tab, 'ReScript Language Server' channel for details.",
      );
      outputChannel.show();
    }
  });

  commands.registerCommand("rescript-vscode.showProblems", async () => {
    try {
      await commands.executeCommand("workbench.actions.view.problems");
    } catch {
      outputChannel.show();
    }
  });

  commands.registerCommand("rescript-vscode.paste_as_rescript_json", () => {
    customCommands.pasteAsRescriptJson();
  });

  commands.registerCommand("rescript-vscode.paste_as_rescript_jsx", () => {
    customCommands.pasteAsRescriptJsx();
  });

  commands.registerCommand(
    "rescript-vscode.go_to_location",
    async (fileUri: string, startLine: number, startCol: number) => {
      await window.showTextDocument(Uri.parse(fileUri), {
        selection: new Range(
          new Position(startLine, startCol),
          new Position(startLine, startCol),
        ),
      });
    },
  );

  commands.registerCommand("rescript-vscode.switch-impl-intf", () => {
    customCommands.switchImplIntf(client);
  });

  // Start build command
  commands.registerCommand("rescript-vscode.start_build", async () => {
    let currentDocument = window.activeTextEditor?.document;
    if (!currentDocument) {
      window.showErrorMessage("No active document found.");
      return;
    }

    try {
      const result = (await client.sendRequest("rescript/startBuild", {
        uri: currentDocument.uri.toString(),
      })) as { success: boolean };

      if (result.success) {
        window.showInformationMessage("Build watcher started.");
      } else {
        window.showErrorMessage(
          "Failed to start build. Check that a ReScript project is open.",
        );
      }
    } catch (e) {
      window.showErrorMessage(`Failed to start build: ${String(e)}`);
    }
  });

  commands.registerCommand(
    "rescript-vscode.restart_language_server",
    async () => {
      await client.stop();
      const newClient = await createLanguageClient();
      if (newClient) {
        client = newClient;
        client.start();
      }
    },
  );

  // Start the client. This will also launch the server
  client.start();

  // Restart the language client automatically when certain configuration
  // changes.
  context.subscriptions.push(
    workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
      if (
        affectsConfiguration("rescript.settings.lspCommand") ||
        affectsConfiguration("rescript.settings.initializationOptions")
      ) {
        commands.executeCommand("rescript-vscode.restart_language_server");
      } else {
        if (affectsConfiguration("rescript.settings.compileStatus.enable")) {
          compileStatusEnabled = workspace
            .getConfiguration("rescript.settings")
            .get<boolean>("compileStatus.enable", true);
          refreshCompilationStatusItem();
        }
        client
          .sendNotification("workspace/didChangeConfiguration")
          .catch((err) => {
            window.showErrorMessage(String(err));
          });
      }
    }),
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
