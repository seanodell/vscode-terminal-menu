import * as vscode from "vscode";
import {
    MenuProviderRegistry,
    MenuCommand,
    getAllProviders
} from "./providers";

const providerRegistry = new MenuProviderRegistry();

export { MenuCommand };

export function activate(context: vscode.ExtensionContext) {
    console.log(
        'Extension "terminal-menu" is now active!'
    );

    getAllProviders().forEach(provider => {
        providerRegistry.registerProvider(provider);
    });

    const showMenuCommand = vscode.commands.registerCommand(
        "terminal-menu.showMenu",
        async () => {
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                vscode.window.showErrorMessage(
                    "No workspace folder open. Please open a folder first."
                );
                return;
            }

            interface QuickPickItemWithMenuItem extends vscode.QuickPickItem {
                menuItem: MenuCommand;
            }

            const allQuickPickItems: QuickPickItemWithMenuItem[] = [];

            for (const workspaceFolder of vscode.workspace.workspaceFolders) {
                const menuItems = await providerRegistry.getMenuItems(workspaceFolder.uri.fsPath);

                const quickPickItems: QuickPickItemWithMenuItem[] = menuItems.map((item) => ({
                    label: item.label,
                    description: item.source ? `from ${workspaceFolder.name}/${item.source}` : undefined,
                    detail: item.command,
                    menuItem: item
                }));

                allQuickPickItems.push(...quickPickItems);
            }

            if (allQuickPickItems.length === 0) {
                vscode.window.showInformationMessage(
                    "No terminal menu items found. Create a supported configuration file or check your enabled configuration types in settings.",
                    "Open Settings"
                ).then(selection => {
                    if (selection === "Open Settings") {
                        vscode.commands.executeCommand("workbench.action.openSettings", "terminalMenu.enabledConfigTypes");
                    }
                });
                return;
            }


            const selectedItem = await vscode.window.showQuickPick(
                allQuickPickItems,
                {
                    placeHolder: "Select a terminal command to run",
                }
            );

            if (selectedItem) {
                const terminal =
                    vscode.window.activeTerminal || vscode.window.createTerminal();
                terminal.show();

                const config = vscode.workspace.getConfiguration("terminalMenu");
                const autoEnter = config.get<boolean>("autoEnter", true);

                terminal.sendText(selectedItem.menuItem.command, autoEnter);
            }
        }
    );

    context.subscriptions.push(showMenuCommand);
}

export function deactivate() { }
