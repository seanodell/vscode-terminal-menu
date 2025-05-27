## [0.3.1]

- Minor documentation improvements

## [0.3.0]

- Made `enabledConfigTypes` setting dynamically use all available providers
  - When empty, all registered providers are used by default
  - Makes it easier to extend with additional providers
- Added `Terminal Menu: Select Enabled Provider Types` command
  - Provides a dynamic multi-select interface for enabling/disabling providers
  - Shows all currently registered provider types
- Added `enabledWorkspaceFolders` setting to control which workspace folders are searched
- Added `Terminal Menu: Select Workspace Folders` command
  - Provides a dynamic multi-select interface for enabling/disabling workspace folders
  - Helpful for large multi-root workspaces

## [0.2.0]

- Added support for multi-root workspaces
  - Automatically searches for configuration files in all workspace folders
  - Commands are labeled with their workspace folder name
  - All commands from all workspaces are combined in a single menu

## [0.1.0]

- Initial release
