# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Build and Development:**
- `pnpm build` - Compile TypeScript to dist/
- `pnpm dev` - Watch mode compilation
- `pnpm typecheck` - Type checking without emitting files

**Code Quality:**
- `pnpm lint` - Check code with Biome
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Biome
- `pnpm format:check` - Check formatting without fixing

**Testing:**
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `vitest run tests/specific.test.ts` - Run specific test file

**CLI Development:**
- `pnpm dev:cli -- [args]` - Test CLI locally (requires build first)
- `pnpm dev:cli -- --version` - Test version output
- `pnpm dev:cli -- --help` - Test help output

**Git Commits:**
- `pnpm commit` - Interactive conventional commit wizard
- All commits are validated against conventional commit format via husky hooks

## Project Architecture

This is a monorepo with two TypeScript packages:

**Package Structure:**
- **@general-dexterity/cube-records** (`packages/records/`): Library with types and functions for CubeJS integration
- **@general-dexterity/cube-records-codegen** (`packages/codegen/`): CLI tool for generating type definitions from Cube.js schemas
- **Tests**: Each package has its own test files using Vitest

**Records Package:**
- Library exports: `dist/index.js` + `dist/index.d.ts`
- ES Modules with CommonJS support
- Peer dependencies: @cubejs-client/core and @cubejs-client/react

**Codegen Package:**
- CLI binary: `dist/cli/index.js` (executable with shebang)
- ES Modules only (`"type": "module"`)
- CLI reads package.json at runtime for version using ESM path resolution
- Uses Commander.js for CLI argument parsing
- Tests can execute the built CLI using Node.js child_process

## Code Style Guidelines

- **Test descriptions**: Use third person for test descriptions (`it('outputs the correct version')` not `it('should output the correct version')`)