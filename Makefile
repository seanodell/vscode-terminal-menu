# Sample Makefile for Terminal Menu extension

.PHONY: all build test clean package

# Build target
build:
	npm run compile

# Run tests
test:
	npm run test

# Clean build artifacts
clean:
	rm -rf out
	rm -rf node_modules

# Package the extension
package:
	npm run package

# Install the extension
install:
	npm run install-extension

# Default target
all: build test package
