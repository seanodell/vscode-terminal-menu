// Export all provider types
export * from "./types";
export * from "./base-provider";
export * from "./registry";

// Export all concrete providers
export * from "./terminal-menu-provider";
export * from "./mise-toml-provider";
export * from "./justfile-provider";
export * from "./package-json-provider";
export * from "./makefile-provider";

// Re-export all providers in a convenient array
import { MenuProvider } from "./types";
import { TerminalMenuProvider } from "./terminal-menu-provider";
import { MiseTomlProvider } from "./mise-toml-provider";
import { JustfileProvider } from "./justfile-provider";
import { PackageJsonProvider } from "./package-json-provider";
import { MakefileProvider } from "./makefile-provider";

/**
 * Get all built-in providers
 * @returns Array of all built-in providers
 */
export function getAllProviders(): MenuProvider[] {
    return [
        new TerminalMenuProvider(),
        new MiseTomlProvider(),
        new JustfileProvider(),
        new PackageJsonProvider(),
        new MakefileProvider()
    ];
}
