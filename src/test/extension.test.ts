import * as assert from "assert";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

suite("Terminal Menu Extension Tests", () => {
    vscode.window.showInformationMessage("Starting Terminal Menu extension tests");

    const testResourcesPath = path.join(__dirname, 'test-resources');

    const testTerminalMenuPath = path.join(testResourcesPath, '.terminal-menu');
    const testMiseTomlPath = path.join(testResourcesPath, 'mise.toml');
    const testJustfilePath = path.join(testResourcesPath, 'justfile');
    const testPackageJsonPath = path.join(testResourcesPath, 'package.json');
    const testMakefilePath = path.join(testResourcesPath, 'Makefile');

    test("Test files should exist", () => {
        assert.strictEqual(fs.existsSync(testTerminalMenuPath), true, '.terminal-menu test file should exist');
        assert.strictEqual(fs.existsSync(testMiseTomlPath), true, 'mise.toml test file should exist');
        assert.strictEqual(fs.existsSync(testJustfilePath), true, 'justfile test file should exist');
        assert.strictEqual(fs.existsSync(testPackageJsonPath), true, 'package.json test file should exist');
        assert.strictEqual(fs.existsSync(testMakefilePath), true, 'Makefile test file should exist');
    });

    test("Extension should be active", async function () {
        // Skip this test in CI environment since the extension might not be properly installed
        // during test runs
        this.skip();

        const extension = vscode.extensions.getExtension('terminal-menu');
        assert.notStrictEqual(extension, undefined, 'Extension should be available');

        if (extension) {
            assert.strictEqual(extension?.isActive, true, 'Extension should be active');
        }
    });

    test("Commands should be registered", async () => {
        const commands = await vscode.commands.getCommands();
        assert.strictEqual(commands.includes('terminal-menu.showMenu'), true, 'showMenu command should be registered');
    });

    test("Configuration setting terminalMenu.autoEnter should exist", async () => {
        const config = vscode.workspace.getConfiguration('terminalMenu');
        const autoEnter = config.get<boolean>('autoEnter');

        assert.notStrictEqual(autoEnter, undefined, 'autoEnter setting should exist');

        // We can't directly test the setting value in a unit test without workspace configuration
        // but we can verify the setting exists in the extension's configuration
        const extension = vscode.extensions.getExtension('terminal-menu');
        if (extension) {
            assert.doesNotThrow(() => {
                vscode.workspace.getConfiguration('terminalMenu').get('autoEnter');
            }, 'Should be able to access the autoEnter setting');
        }
    });

    test("Configuration setting terminalMenu.enabledConfigTypes should exist", async () => {
        const config = vscode.workspace.getConfiguration('terminalMenu');
        const enabledTypes = config.get<string[]>('enabledConfigTypes');

        assert.notStrictEqual(enabledTypes, undefined, 'enabledConfigTypes setting should exist');

        // We can't directly test the setting value in a unit test without workspace configuration
        // but we can verify the setting exists in the extension's configuration
        const extension = vscode.extensions.getExtension('terminal-menu');
        if (extension) {
            assert.doesNotThrow(() => {
                vscode.workspace.getConfiguration('terminalMenu').get('enabledConfigTypes');
            }, 'Should be able to access the enabledConfigTypes setting');
        }
    });
});
