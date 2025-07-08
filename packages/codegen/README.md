# @general-dexterity/cube-records-codegen

CLI tool for generating TypeScript definitions from Cube.js server metadata.

## Purpose

This package generates TypeScript type definitions from your Cube.js schema, enabling:
- Full IntelliSense support in your IDE
- Type-safe queries with compile-time validation
- Automatic synchronization with your Cube.js schema
- Watch mode for development workflows

## Installation

```bash
npm install --save-dev @general-dexterity/cube-records-codegen
# or
pnpm add -D @general-dexterity/cube-records-codegen
# or
yarn add --dev @general-dexterity/cube-records-codegen
```

### Usage

```bash
# Generate types to stdout
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api

# Generate types to a file
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts

# Watch mode for development
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts --watch
```

## Development & Contributing

### Setup

```bash
# Clone the repository
git clone https://github.com/general-dexterity/cube-records.git
cd cube-records/packages/codegen

# Install dependencies
pnpm install

# Build the package
pnpm build
```

### Development Commands

```bash
pnpm dev        # Watch mode compilation
pnpm test       # Run tests
pnpm typecheck  # Type checking
pnpm dev:cli    # Test CLI locally (requires build first)
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT