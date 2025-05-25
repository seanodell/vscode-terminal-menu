import * as fs from "fs";
import * as path from "path";
import { MenuCommand, MenuProvider } from "./types";

/**
 * Base class for menu providers that simplifies common operations.
 *
 * This abstract class implements the MenuProvider interface and provides
 * utility methods for file operations that are commonly needed by providers.
 *
 * @abstract
 * @class BaseMenuProvider
 * @implements {MenuProvider}
 */
export abstract class BaseMenuProvider implements MenuProvider {
    /**
     * Unique identifier for this provider type.
     * Should match the configuration file name or format.
     * Used for configuration and filtering.
     *
     * @abstract
     * @readonly
     * @type {string}
     * @memberof BaseMenuProvider
     */
    abstract readonly id: string;

    /**
     * Human-readable name for this provider.
     * Used in UI and documentation.
     *
     * @abstract
     * @readonly
     * @type {string}
     * @memberof BaseMenuProvider
     */
    abstract readonly name: string;

    /**
     * Description of what this provider does.
     * Used in UI and documentation.
     *
     * @abstract
     * @readonly
     * @type {string}
     * @memberof BaseMenuProvider
     */
    abstract readonly description: string;

    /**
     * Parse the given folder and return menu commands.
     * Each provider must implement this method to parse its specific
     * configuration file format and return the menu commands.
     *
     * @abstract
     * @param {string} folderPath - The absolute path to the workspace folder
     * @returns {Promise<MenuCommand[]>} Array of menu commands
     * @memberof BaseMenuProvider
     */
    abstract provideMenuItems(folderPath: string): Promise<MenuCommand[]>;

    /**
     * Helper method to check if a file exists at the given path.
     *
     * @protected
     * @param {string} filePath - The absolute path to check
     * @returns {boolean} True if the file exists, false otherwise
     * @memberof BaseMenuProvider
     */
    protected fileExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    /**
     * Helper method to read a file
     * @param filePath The absolute path to read
     * @returns The file contents as a string
     */
    protected readFile(filePath: string): string {
        return fs.readFileSync(filePath, "utf8");
    }

    /**
     * Helper method to join paths
     * @param folderPath The base folder path
     * @param fileName The file name to append
     * @returns The joined path
     */
    protected joinPath(folderPath: string, fileName: string): string {
        return path.join(folderPath, fileName);
    }
}
