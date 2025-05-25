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
        'Extension "seanodell-terminal-menu" is now active!'
    );

    getAllProviders().forEach(provider => {
        providerRegistry.registerProvider(provider);
    });

    const showMenuCommand = vscode.commands.registerCommand(
        "seanodell-terminal-menu.showMenu",
        async () => {
            const activeWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

            if (!activeWorkspace) {
                vscode.window.showErrorMessage(
                    "No workspace open. Please open a folder first."
                );
                return;
            }

            const menuItems = await providerRegistry.getMenuItems(activeWorkspace);

            if (menuItems.length === 0) {
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

            interface QuickPickItemWithMenuItem extends vscode.QuickPickItem {
                menuItem: MenuCommand;
            }

            const quickPickItems: QuickPickItemWithMenuItem[] = menuItems.map((item) => ({
                label: item.label,
                description: item.source ? `from ${item.source}` : undefined,
                detail: item.command,
                menuItem: item
            }));

            const selectedItem = await vscode.window.showQuickPick(
                quickPickItems,
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
