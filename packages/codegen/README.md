# CubeJS TypeScript Type Generator

A modular code generator that creates TypeScript type definitions from CubeJS server metadata. This package provides both a library and CLI tool for generating strongly-typed interfaces for CubeJS cubes and views.

## Architecture

The code generator follows a clean, modular architecture with clear separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  CodeGenerator  │───▶│  TypeGenerator   │───▶│  OutputWriter   │
│   (Orchestrate) │    │ (Generate Types) │    │ (Write Output)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│DefinitionRetrive│    │  TypeScript AST  │    │  File/Stdout    │
│ (Fetch Metadata)│    │      Nodes       │    │    Output       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

#### 1. **CodeGenerator**
- **Purpose**: Main orchestrator that coordinates the entire type generation process
- **Responsibilities**:
  - Manages the generation workflow
  - Handles watch mode for continuous updates
  - Coordinates between other components
  - Applies exclusion filters

#### 2. **TypeGenerator** 
- **Purpose**: Generates TypeScript AST nodes from cube definitions
- **Responsibilities**:
  - Creates TypeScript interface declarations
  - Generates shared types (`CubeDimension`, `CubeMeasure`)
  - Builds union types (`CubeModel`, `CubeView`, `CubeResource`)
  - Focuses solely on type generation logic

#### 3. **OutputWriter**
- **Purpose**: Handles all output operations
- **Responsibilities**:
  - Converts TypeScript AST nodes to formatted strings
  - Writes output to files or stdout
  - Manages file operations and error handling
  - Supports UTF-8 encoding

#### 4. **DefinitionRetriever**
- **Purpose**: Fetches cube metadata from CubeJS server
- **Responsibilities**:
  - Makes HTTP requests to CubeJS meta endpoint
  - Transforms cube definitions with relation information
  - Handles network errors and invalid responses

## Features

### Generated Types

The generator creates several types of TypeScript definitions:

#### Shared Base Types
```typescript
interface CubeDimension<T extends string | number | boolean> {
  name: string;
  type: T;
  description?: string;
}

interface CubeMeasure<T extends string | number | boolean> {
  name: string;
  type: T;
  description?: string;
}
```

#### Cube-Specific Interfaces
```typescript
interface OrdersCubeModel {
  name: "Orders";
  measures: {
    count: CubeMeasure<number>;
    totalAmount: CubeMeasure<number>;
  };
  dimensions: {
    status: CubeDimension<string>;
    createdAt: CubeDimension<string>;
  };
  joins: ["Users", "Products"];
  segments: string[];
}
```

#### Union Types
```typescript
type CubeModel = OrdersCubeModel | ProductsCubeModel | ...;
type CubeView = OrdersViewCubeView | ...;
type CubeResource = CubeModel | CubeView;

interface CubeModelNameMap {
  Orders: OrdersCubeModel;
  Products: ProductsCubeModel;
  // ...
}
```

### CLI Usage

```bash
# Generate types to stdout
cube-records --baseUrl http://localhost:4000/cubejs-api

# Generate types to file
cube-records --output ./types/cubes.ts

# Watch mode for development
cube-records --watch --output ./types/cubes.ts

# Exclude specific cubes
cube-records --exclude "InternalCube,TestCube"

# Custom polling interval (watch mode)
cube-records --watch --duration 10000
```

### Library Usage

```typescript
import { CodeGenerator, TypeGenerator, OutputWriter } from '@general-dexterity/cube-records-codegen';

// Full generation workflow
const generator = new CodeGenerator({
  baseUrl: 'http://localhost:4000/cubejs-api',
  output: './types/cubes.ts',
  exclude: ['InternalCube'],
  watch: false,
  watchDelay: 5000
});

await generator.run();

// Manual type generation
const typeGenerator = new TypeGenerator();
const outputWriter = new OutputWriter();

// Get cube definitions (implement your own retrieval)
const definitions = await getCubeDefinitions();

// Generate TypeScript nodes
const nodes = typeGenerator.generateTypes(definitions);

// Write to file or stdout
await outputWriter.writeNodes(nodes, './types/cubes.ts');
await outputWriter.writeNodes(nodes, '-'); // stdout
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | `http://localhost:4000/cubejs-api` | CubeJS server base URL |
| `output` | `string` | `'-'` | Output file path or `'-'` for stdout |
| `exclude` | `string[]` | `[]` | Cube names to exclude from generation |
| `watch` | `boolean` | `false` | Enable watch mode for continuous updates |
| `watchDelay` | `number` | `5000` | Polling interval in milliseconds for watch mode |

## Development

### Project Structure

```
src/
├── index.ts              # CLI entry point
├── code-generator.ts     # Main orchestrator
├── type-generator.ts     # TypeScript AST generation
├── output-writer.ts      # Output handling
├── definition-retriever.ts # CubeJS metadata fetching
├── constants.ts          # Naming constants
├── utils.ts             # Utility functions
├── types.ts             # Type definitions
└── cube.d.ts            # CubeJS type definitions

tests/
├── type-generator.test.ts
├── output-writer.test.ts
├── definition-retriever.test.ts
└── cli.test.ts
```

### Building

```bash
# Build the package
pnpm build

# Development mode
pnpm dev

# Type checking
pnpm typecheck
```

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Specific test file
vitest run tests/type-generator.test.ts
```

### Code Quality

```bash
# Lint code
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## Design Principles

### 1. **Separation of Concerns**
Each class has a single, well-defined responsibility:
- `TypeGenerator`: Pure type generation logic
- `OutputWriter`: Pure output operations
- `CodeGenerator`: Orchestration only
- `DefinitionRetriever`: Data fetching only

### 2. **Testability**
- Small, focused classes are easy to unit test
- Pure functions with predictable inputs/outputs
- Comprehensive test coverage for all components
- Mocked dependencies for isolated testing

### 3. **Modularity**
- Classes can be used independently
- Easy to extend or replace individual components
- Clear interfaces between components
- Minimal coupling between modules

### 4. **Type Safety**
- Full TypeScript coverage
- Leverages TypeScript compiler API for AST generation
- Type-safe configuration and options
- Runtime type checking where appropriate

## Edge Cases and Limitations

### Potential Issues with Type Generation

1. **Empty Model/View Lists**: If no models or views exist, union types may be incorrectly generated
2. **Invalid TypeScript Identifiers**: Cube names with special characters may create invalid interface names
3. **Reserved Keywords**: Cubes named with TypeScript keywords could cause compilation errors
4. **Name Collisions**: Different cube names that transform to the same identifier
5. **Very Long Names**: Extremely long cube names might exceed identifier limits
6. **Unicode Characters**: Special characters that don't translate well to valid identifiers

### Recommendations

- Validate cube names before generation
- Implement name sanitization for edge cases
- Add warnings for potentially problematic cube names
- Consider adding a validation mode to check for issues

## Contributing

1. Follow the existing architecture patterns
2. Add tests for new functionality
3. Update this README for significant changes
4. Use conventional commit messages
5. Ensure all linting and type checking passes

## License

This package is part of the cube-records project and follows the same licensing terms.