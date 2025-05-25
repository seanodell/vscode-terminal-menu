import { MenuCommand } from "./types";
import { BaseMenuProvider } from "./base-provider";

/**
 * Provider for Makefile targets
 */
export class MakefileProvider extends BaseMenuProvider {
    readonly id = "Makefile";
    readonly name = "Makefile targets";
    readonly description = "Parse targets from Makefiles";

    async provideMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];
        const makefilePaths = [
            this.joinPath(folderPath, "Makefile"),
            this.joinPath(folderPath, "makefile"),
            this.joinPath(folderPath, "GNUmakefile")
        ];

        try {
            for (const makefilePath of makefilePaths) {
                if (this.fileExists(makefilePath)) {
                    const content = this.readFile(makefilePath);
                    const lines = content.split("\n");

                    const targetRegex = /^([a-zA-Z0-9_-]+)[ \t]*:(?:[^=]|$)/;

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();

                        if (line === "" || line.startsWith("#") || line.startsWith("include ")) {
                            continue;
                        }

                        const match = line.match(targetRegex);
                        if (match) {
                            const targetName = match[1];

                            // Skip internal targets (those starting with .)
                            if (targetName.startsWith(".")) {
                                continue;
                            }

                            const label = `make: ${targetName}`;
                            const command = `make ${targetName}`;

                            menuItems.push({
                                label,
                                command,
                                source: "Makefile"
                            });
                        }
                    }

                    // We only need to process one Makefile if multiple exist
                    break;
                }
            }
        } catch (error) {
            console.error(`Error reading or parsing Makefile: ${error}`);
        }

        return menuItems;
    }
}
