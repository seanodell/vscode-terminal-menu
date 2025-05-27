import * as vscode from "vscode";
import { MenuProvider, MenuCommand } from "./types";

/**
 * Registry that manages all menu providers
 */
export class MenuProviderRegistry {
    private providers: Map<string, MenuProvider> = new Map();

    registerProvider(provider: MenuProvider): void {
        this.providers.set(provider.id, provider);
    }

    getAllProviders(): MenuProvider[] {
        return Array.from(this.providers.values());
    }

    getProvider(id: string): MenuProvider | undefined {
        return this.providers.get(id);
    }

    async getMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];
        const config = vscode.workspace.getConfiguration("terminalMenu");

        let allProviders = this.getAllProviders();

        const defaultEnabledTypes = allProviders.map(provider => provider.id);
        const enabledTypes = config.get<string[]>("enabledConfigTypes", defaultEnabledTypes);

        const enabledProviders = allProviders.filter(
            provider => enabledTypes.includes(provider.id)
        );

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
