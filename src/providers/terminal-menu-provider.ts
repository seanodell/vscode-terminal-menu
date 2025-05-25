import { MenuCommand } from "./types";
import { BaseMenuProvider } from "./base-provider";

/**
 * Provider for .terminal-menu files
 */
export class TerminalMenuProvider extends BaseMenuProvider {
    readonly id = ".terminal-menu";
    readonly name = ".terminal-menu files";
    readonly description = "Parse commands from .terminal-menu files";

    async provideMenuItems(folderPath: string): Promise<MenuCommand[]> {
        const menuItems: MenuCommand[] = [];
        const menuFilePath = this.joinPath(folderPath, ".terminal-menu");

        try {
            if (this.fileExists(menuFilePath)) {
                const content = this.readFile(menuFilePath);
                const lines = content.split("\n");

                for (const line of lines) {
                    const trimmedLine = line.trim();

                    if (trimmedLine === "" || trimmedLine.startsWith("#")) {
                        continue;
                    }

                    const colonIndex = trimmedLine.indexOf(":");
                    if (colonIndex > 0) {
                        const label = trimmedLine.substring(0, colonIndex).trim();
                        const command = trimmedLine.substring(colonIndex + 1).trim();
                        menuItems.push({ label, command, source: ".terminal-menu" });
                    } else {
                        menuItems.push({
                            label: trimmedLine,
                            command: trimmedLine,
                            source: ".terminal-menu"
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading .terminal-menu file: ${error}`);
        }

        return menuItems;
    }
}
