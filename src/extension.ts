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

    const selectProvidersCommand = vscode.commands.registerCommand(
        "terminal-menu.selectProviders",
        async () => {
            const providers = providerRegistry.getAllProviders();
            const config = vscode.workspace.getConfiguration("terminalMenu");
            const currentEnabledTypes = config.get<string[]>("enabledConfigTypes", []);

            const quickPickItems = providers.map(provider => ({
                label: provider.id,
                description: provider.name,
                picked: currentEnabledTypes.length === 0 || currentEnabledTypes.includes(provider.id)
            }));

            const selectedItems = await vscode.window.showQuickPick(
                quickPickItems,
                {
                    canPickMany: true,
                    placeHolder: "Select which configuration file types to include in the terminal menu"
                }
            );

            if (selectedItems) {
                const selectedProviderIds = selectedItems.map(item => item.label);
                await config.update("enabledConfigTypes", selectedProviderIds, vscode.ConfigurationTarget.Workspace);

                if (selectedProviderIds.length === 0) {
                    vscode.window.showInformationMessage("All provider types enabled (default behavior)");
                } else {
                    vscode.window.showInformationMessage(`Enabled provider types: ${selectedProviderIds.join(", ")}`);
                }
            }
        }
    );

    context.subscriptions.push(selectProvidersCommand);

    const selectWorkspaceFoldersCommand = vscode.commands.registerCommand(
        "terminal-menu.selectWorkspaceFolders",
        async () => {
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                vscode.window.showErrorMessage(
                    "No workspace folder open. Please open a folder first."
                );
                return;
            }

            if (vscode.workspace.workspaceFolders.length === 1) {
                vscode.window.showInformationMessage(
                    "Only one workspace folder is open. All configuration files will be used from this folder."
                );
                return;
            }

            const config = vscode.workspace.getConfiguration("terminalMenu");
            const currentEnabledFolders = config.get<string[]>("enabledWorkspaceFolders", []);

            const quickPickItems = vscode.workspace.workspaceFolders.map(folder => ({
                label: folder.name,
                description: folder.uri.fsPath,
                picked: currentEnabledFolders.length === 0 || currentEnabledFolders.includes(folder.name)
            }));

            const selectedItems = await vscode.window.showQuickPick(
                quickPickItems,
                {
                    canPickMany: true,
                    placeHolder: "Select which workspace folders to search for configuration files"
                }
            );

            if (selectedItems) {
                const selectedFolderNames = selectedItems.map(item => item.label);
                await config.update("enabledWorkspaceFolders", selectedFolderNames, vscode.ConfigurationTarget.Workspace);

                if (selectedFolderNames.length === 0) {
                    vscode.window.showInformationMessage("All workspace folders enabled (default behavior)");
                } else {
                    vscode.window.showInformationMessage(`Enabled workspace folders: ${selectedFolderNames.join(", ")}`);
                }
            }
        }
    );

    context.subscriptions.push(selectWorkspaceFoldersCommand);

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

            const config = vscode.workspace.getConfiguration("terminalMenu");
            const enabledFolders = config.get<string[]>("enabledWorkspaceFolders", []);

            const foldersToSearch = enabledFolders.length === 0
                ? vscode.workspace.workspaceFolders
                : vscode.workspace.workspaceFolders.filter(folder => enabledFolders.includes(folder.name));

            for (const workspaceFolder of foldersToSearch) {
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
                    "No terminal menu items found. Create a supported configuration file or check your enabled settings.",
                    "Select Provider Types",
                    "Select Workspace Folders",
                    "Open Settings"
                ).then(selection => {
                    if (selection === "Open Settings") {
                        vscode.commands.executeCommand("workbench.action.openSettings", "terminalMenu");
                    } else if (selection === "Select Provider Types") {
                        vscode.commands.executeCommand("terminal-menu.selectProviders");
                    } else if (selection === "Select Workspace Folders") {
                        vscode.commands.executeCommand("terminal-menu.selectWorkspaceFolders");
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
