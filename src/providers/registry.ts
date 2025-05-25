import * as vscode from "vscode";
import { MenuProvider, MenuCommand } from "./types";

/**
 * Registry that manages all menu providers
 */
export class MenuProviderRegistry {
    private providers: Map<string, MenuProvider> = new Map();

    /**
     * Register a new menu provider
     * @param provider The provider to register
     */
    registerProvider(provider: MenuProvider): void {
        this.providers.set(provider.id, provider);
    }

    /**
     * Get all registered providers
     * @returns Array of all providers
     */
    getAllProviders(): MenuProvider[] {
        return Array.from(this.providers.values());
    }

    /**
     * Get a provider by ID
     * @param id The provider ID
     * @returns The provider or undefined if not found
     */
    getProvider(id: string): MenuProvider | undefined {
        return this.providers.get(id);
    }

    /**
     * Get menu items from all enabled providers
     * @param folderPath The workspace folder path
     * @returns Promise resolving to an array of menu items
     */
    async getMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];
        const config = vscode.workspace.getConfiguration("terminalMenu");
        const enabledTypes = config.get<string[]>("enabledConfigTypes", [
            ".terminal-menu",
            "mise.toml",
            "justfile",
            "package.json",
            "Makefile"
        ]);

        // Get all providers that are enabled
        const enabledProviders = this.getAllProviders().filter(
            provider => enabledTypes.includes(provider.id)
        );

        // Process each provider
        for (const provider of enabledProviders) {
            try {
                const providerItems = await provider.provideMenuItems(folderPath);
                menuItems.push(...providerItems);
            } catch (error) {
                console.error(`Error in provider ${provider.id}: ${error}`);
            }
        }

        return menuItems;
    }
}
