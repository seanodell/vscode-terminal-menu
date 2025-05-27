# Developer Documentation: Provider Architecture

This document explains the provider-based architecture used in the Terminal Menu extension.

## Overview

The Terminal Menu extension uses a modular provider architecture to parse different configuration file types. Each file type has its own provider implementation, which allows for:

1. Separation of concerns
2. Easier maintenance
3. Extensibility following the open/closed principle

## Core Components

1. MenuCommand Interface
2. MenuProvider Interface
3. BaseMenuProvider Abstract Class (provides common utility methods for all providers)
4. MenuProviderRegistry (manages all providers and handles configuration settings)

## Provider Implementation Guidelines

When implementing a new provider, follow these guidelines:

1. Return an array of menu items instead of modifying a shared array. This reduces side effects and improves modularity.
2. Your implementation should:
   - Parse the configuration file
   - Create `MenuCommand` objects for each command found
   - Return the array of commands
   - Handle errors gracefully

## Implementing a New Provider

To add support for a new configuration file type:

1. Create a new file in the `providers` directory, e.g., `my-provider.ts`
2. Implement the `MenuProvider` by extending `BaseMenuProvider`
3. Register your provider in `providers/index.ts`
4. Add your provider to the array in `getAllProviders()` in `providers/index.ts`
5. Update the configuration in `package.json` to include your provider's ID

## Testing

Each provider should have corresponding tests in `src/test/providers.test.ts`.

You can create test resources in `src/test/test-resources/`.
