import * as toml from "@iarna/toml";
import { MenuCommand } from "./types";
import { BaseMenuProvider } from "./base-provider";

/**
 * Provider for mise.toml files
 */
export class MiseTomlProvider extends BaseMenuProvider {
    readonly id = "mise.toml";
    readonly name = "mise.toml tasks";
    readonly description = "Parse tasks from mise.toml files";

    async provideMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];
        const miseTomlPath = this.joinPath(folderPath, "mise.toml");

        try {
            if (this.fileExists(miseTomlPath)) {
                const content = this.readFile(miseTomlPath);
                const parsedToml = toml.parse(content);

                if (parsedToml.tasks) {
                    for (const [taskName, taskConfig] of Object.entries(parsedToml.tasks)) {
                        if (typeof taskConfig === 'object' && taskConfig !== null && 'run' in taskConfig) {
                            const run = taskConfig.run as string;
                            const label = `mise: ${taskName}`;
                            const command = `mise run ${taskName}`;

                            menuItems.push({
                                label,
                                command,
                                source: "mise.toml"
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading or parsing mise.toml file: ${error}`);
        }

        return menuItems;
    }
}
