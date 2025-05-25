import { MenuCommand } from "./types";
import { BaseMenuProvider } from "./base-provider";

/**
 * Provider for package.json npm scripts
 */
export class PackageJsonProvider extends BaseMenuProvider {
    readonly id = "package.json";
    readonly name = "package.json scripts";
    readonly description = "Parse npm scripts from package.json";

    async provideMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];
        const packageJsonPath = this.joinPath(folderPath, "package.json");

        try {
            if (this.fileExists(packageJsonPath)) {
                const content = this.readFile(packageJsonPath);
                const packageJson = JSON.parse(content);

                if (packageJson.scripts && typeof packageJson.scripts === 'object') {
                    for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
                        if (typeof scriptCommand === 'string') {
                            const label = `npm: ${scriptName}`;
                            const command = `npm run ${scriptName}`;

                            menuItems.push({
                                label,
                                command,
                                source: "package.json"
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading or parsing package.json file: ${error}`);
        }

        return menuItems;
    }
}
