# Terminal Menu Extension justfile
# Use 'just <recipe-name>' to run a recipe

# Build the extension
build:
    npm run compile

# Package the extension
package:
    npm run package

# Run tests
test:
    npm run test

# Install the extension locally
install:
    code --install-extension terminal-menu-*.vsix

# Clean build artifacts
@clean:
    rm -rf out

# Start development mode with TypeScript watch
dev:
    npm run watch
