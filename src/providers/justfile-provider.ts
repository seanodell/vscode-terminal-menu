import { MenuCommand } from "./types";
import { BaseMenuProvider } from "./base-provider";

/**
 * Provider for justfile recipes
 */
export class JustfileProvider extends BaseMenuProvider {
    readonly id = "justfile";
    readonly name = "justfile recipes";
    readonly description = "Parse recipes from justfile";

    async provideMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];

        // Check for both "justfile" and "Justfile" (case-sensitive)
        const justfilePaths = [
            this.joinPath(folderPath, "justfile"),
            this.joinPath(folderPath, "Justfile"),
        ];

        try {
            for (const justfilePath of justfilePaths) {
                if (this.fileExists(justfilePath)) {
                    const content = this.readFile(justfilePath);
                    const lines = content.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();

                        if (line === "" || line.startsWith("#")) {
                            continue;
                        }

                        const colonIndex = line.indexOf(":");
                        if (colonIndex > 0) {
                            const parts = line.substring(0, colonIndex).trim().split(/\s+/);
                            const recipeName = parts[0];

                            // Skip hidden recipes (prefixed with @)
                            if (recipeName.startsWith("@")) {
                                continue;
                            }

                            const label = `just: ${recipeName}`;
                            const command = `just ${recipeName}`;

                            menuItems.push({
                                label,
                                command,
                                source: "justfile",
                            });
                        }
                    }

                    // We only need to process one justfile if both exist
                    break;
                }
            }
        } catch (error) {
            console.error(`Error reading or parsing justfile: ${error}`);
        }

        return menuItems;
    }
}
