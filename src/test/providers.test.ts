import * as assert from "assert";
import * as path from "path";
import * as fs from "fs";
import { MenuCommand, MenuProviderRegistry } from "../providers";
import {
    TerminalMenuProvider,
    MiseTomlProvider,
    JustfileProvider,
    PackageJsonProvider,
    MakefileProvider
} from "../providers";

suite("Terminal Menu Providers Tests", () => {
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

    test("TerminalMenuProvider parsing", async () => {
        const provider = new TerminalMenuProvider();
        const menuItems = await provider.provideMenuItems(testResourcesPath);

        assert.strictEqual(menuItems.length, 3, 'Should parse 3 commands from .terminal-menu file');
        assert.strictEqual(menuItems[0].label, 'test command', 'First command should be parsed correctly');
        assert.strictEqual(menuItems[1].label, 'labeled command', 'Command with label should be parsed correctly');
        assert.strictEqual(menuItems[1].command, 'echo This is a test', 'Command value should be parsed correctly');
        assert.strictEqual(menuItems[2].label, 'another command', 'Last command should be parsed correctly');
        assert.strictEqual(menuItems[0].source, '.terminal-menu', 'Source should be set correctly');
    });

    test("MiseTomlProvider parsing", async () => {
        const provider = new MiseTomlProvider();
        const menuItems = await provider.provideMenuItems(testResourcesPath);

        assert.strictEqual(menuItems.length, 3, 'Should extract 3 tasks from mise.toml file');
        assert.strictEqual(menuItems[0].label, 'mise: test', 'First task should be extracted correctly');
        assert.strictEqual(menuItems[1].label, 'mise: build', 'Second task should be extracted correctly');
        assert.strictEqual(menuItems[2].label, 'mise: clean', 'Third task should be extracted correctly');
        assert.strictEqual(menuItems[0].command, 'mise run test', 'Task command should be formatted correctly');
        assert.strictEqual(menuItems[0].source, 'mise.toml', 'Source should be set correctly');
    });

    test("JustfileProvider parsing", async () => {
        const provider = new JustfileProvider();
        const menuItems = await provider.provideMenuItems(testResourcesPath);

        assert.strictEqual(menuItems.length, 3, 'Should parse 3 visible recipes from justfile');

        const recipeNames = menuItems.map(item => item.label.replace('just: ', ''));
        assert.ok(recipeNames.includes('build'), 'Should include the build recipe');
        assert.ok(recipeNames.includes('test'), 'Should include the test recipe');
        assert.ok(recipeNames.includes('lint'), 'Should include the lint recipe');
        assert.ok(!recipeNames.includes('clean'), 'Should not include the hidden @clean recipe');

        const buildItem = menuItems.find(item => item.label === 'just: build');
        assert.strictEqual(buildItem?.command, 'just build', 'Command should be formatted correctly');
        assert.strictEqual(buildItem?.source, 'justfile', 'Source should be set correctly');
    });

    test("PackageJsonProvider parsing", async () => {
        const provider = new PackageJsonProvider();
        const menuItems = await provider.provideMenuItems(testResourcesPath);

        assert.strictEqual(menuItems.length, 4, 'Should parse 4 scripts from package.json file');

        const scriptNames = menuItems.map(item => item.label.replace('npm: ', ''));
        assert.ok(scriptNames.includes('start'), 'Should include the start script');
        assert.ok(scriptNames.includes('test'), 'Should include the test script');
        assert.ok(scriptNames.includes('build'), 'Should include the build script');
        assert.ok(scriptNames.includes('lint'), 'Should include the lint script');

        // Check command format
        const buildItem = menuItems.find(item => item.label === 'npm: build');
        assert.strictEqual(buildItem?.command, 'npm run build', 'Command should be formatted correctly');
        assert.strictEqual(buildItem?.source, 'package.json', 'Source should be set correctly');
    });

    test("MakefileProvider parsing", async () => {
        const provider = new MakefileProvider();
        const menuItems = await provider.provideMenuItems(testResourcesPath);

        const menuLabels = menuItems.map(item => item.label);

        assert.ok(menuLabels.some(label => label === 'make: build'), 'Should include the build target');
        assert.ok(menuLabels.some(label => label === 'make: test'), 'Should include the test target');
        assert.ok(menuLabels.some(label => label === 'make: clean'), 'Should include the clean target');
        assert.ok(!menuLabels.some(label => label === 'make: .internal'), 'Should not include internal targets');

        const buildItem = menuItems.find(item => item.label === 'make: build');
        assert.strictEqual(buildItem?.command, 'make build', 'Command should be formatted correctly');
        assert.strictEqual(buildItem?.source, 'Makefile', 'Source should be set correctly');
    });

    test("MenuProviderRegistry should aggregate items", async () => {
        const registry = new MenuProviderRegistry();

        registry.registerProvider(new TerminalMenuProvider());
        registry.registerProvider(new MiseTomlProvider());
        registry.registerProvider(new JustfileProvider());
        registry.registerProvider(new PackageJsonProvider());
        registry.registerProvider(new MakefileProvider());

        const menuItems = await registry.getMenuItems(testResourcesPath);

        const sources = new Set(menuItems.map(item => item.source));

        assert.ok(sources.has('.terminal-menu'), 'Should include items from .terminal-menu');
        assert.ok(sources.has('mise.toml'), 'Should include items from mise.toml');
        assert.ok(sources.has('justfile'), 'Should include items from justfile');
        assert.ok(sources.has('package.json'), 'Should include items from package.json');
        assert.ok(sources.has('Makefile'), 'Should include items from Makefile');

        // Check if registry properly filters disabled providers
        // Mock configuration by extending the class for testing purposes
        class TestRegistry extends MenuProviderRegistry {
            override async getMenuItems(folderPath: string): Promise<MenuCommand[]> {
                const menuItems: MenuCommand[] = [];
                const enabledProviders = this.getAllProviders().filter(
                    provider => ['.terminal-menu', 'package.json'].includes(provider.id)
                );

                for (const provider of enabledProviders) {
                    const providerItems = await provider.provideMenuItems(folderPath);
                    menuItems.push(...providerItems);
                }

                return menuItems;
            }
        }

        const testRegistry = new TestRegistry();
        testRegistry.registerProvider(new TerminalMenuProvider());
        testRegistry.registerProvider(new MiseTomlProvider());
        testRegistry.registerProvider(new PackageJsonProvider());

        const filteredItems = await testRegistry.getMenuItems(testResourcesPath);
        const filteredSources = new Set(filteredItems.map(item => item.source));

        assert.ok(filteredSources.has('.terminal-menu'), 'Should include items from enabled .terminal-menu');
        assert.ok(filteredSources.has('package.json'), 'Should include items from enabled package.json');
        assert.ok(!filteredSources.has('mise.toml'), 'Should not include items from disabled mise.toml');
    });
});
