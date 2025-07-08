# @general-dexterity/cube-records

Type-safe React hooks for Cube.js that provide autocompletion and simplified data access.

## Purpose

This package wraps Cube.js React hooks to provide:
- Full TypeScript autocompletion for cube names, measures, and dimensions
- Simplified result data without cube name prefixes
- Type-safe joins across cube models
- Zero runtime overhead

## Installation

```bash
npm install @general-dexterity/cube-records
# or
pnpm add @general-dexterity/cube-records
# or
yarn add @general-dexterity/cube-records
```

### Prerequisites

- `@cubejs-client/core` ^1.3.34
- `@cubejs-client/react` ^1.3.34
- `react` ^18.0.0 || ^19.0.0

## Development & Contributing

### Setup

```bash
# Clone the repository
git clone https://github.com/general-dexterity/cube-records.git
cd cube-records/packages/records

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
pnpm lint       # Check code with Biome
pnpm format     # Format code with Biome
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
