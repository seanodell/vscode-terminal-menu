import * as vscode from "vscode";

/**
 * Interface representing a command in the terminal menu
 */
export interface MenuCommand {
    /** The display label shown in the menu */
    label: string;
    /** The actual command that will be executed */
    command: string;
    /** The source of the command (e.g., "package.json", "Makefile") */
    source?: string;
}

/**
 * Interface for menu providers that can contribute commands to the terminal menu
 */
export interface MenuProvider {
    /** Unique identifier for this provider */
    readonly id: string;

    /** Human-readable name for this provider */
    readonly name: string;

    /** Description of what this provider does */
    readonly description: string;

    /**
     * Parse the given folder and return menu commands
     * @param folderPath The absolute path to the workspace folder
     * @returns Array of menu commands
     */
    provideMenuItems(folderPath: string): Promise<MenuCommand[]>;
}
