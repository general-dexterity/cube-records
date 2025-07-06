# Cube Records CodeGen

A TypeScript code generator that creates type definitions from Cube.js server metadata for use with the `@general-dexterity/cube-records` package.

## Overview

This package generates TypeScript module augmentations that extend the `CubeRecordMap` interface from `@general-dexterity/cube-records`, enabling full type safety and autocompletion when using the `useCubeRecordQuery` hook.

## Installation

```bash
npm install @general-dexterity/cube-records-codegen
# or
pnpm add @general-dexterity/cube-records-codegen
# or
yarn add @general-dexterity/cube-records-codegen
```

## Quick Start

### CLI Usage

Generate types from your Cube.js server:

```bash
# Generate types to stdout
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api

# Generate types to a file
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts

# Watch mode for development
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts --watch
```

### Generated Output

The generator creates a clean module augmentation file:

```typescript
declare module '@general-dexterity/cube-records' {
  interface CubeRecordMap {
    orders: {
      measures: {
        count: { type: number };
        total: { type: number };
      };
      dimensions: {
        id: { type: string };
        status: { type: string };
        createdAt: { type: string };
      };
      joins?: ['users'];
    };
    users: {
      measures: {
        count: { type: number };
      };
      dimensions: {
        id: { type: string };
        name: { type: string };
        email: { type: string };
      };
      joins?: [];
    };
  }
}
```

### Using Generated Types

Once you've generated the types, import them in your application:

```typescript
// src/app.tsx
import { useCubeRecordQuery } from '@general-dexterity/cube-records';
import './cube-types'; // Import to register the global types

function App() {
  // Full TypeScript autocompletion for cube names, measures, and dimensions
  const { data, isLoading } = useCubeRecordQuery('orders', {
    measures: ['count', 'total'],
    dimensions: ['status', 'createdAt'],
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.map((row) => (
        <div key={row.id}>
          Status: {row.status}, Total: {row.total}
        </div>
      ))}
    </div>
  );
}
```

## CLI Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--baseUrl` | `string` | `http://localhost:4000/cubejs-api` | Cube.js server base URL |
| `--output` | `string` | `'-'` | Output file path or `'-'` for stdout |
| `--watch` | `boolean` | `false` | Enable watch mode for continuous updates |
| `--duration` | `number` | `5000` | Polling interval in milliseconds for watch mode |

## Library Usage

You can also use the generator programmatically:

```typescript
import { CodeGenerator } from '@general-dexterity/cube-records-codegen';

const generator = new CodeGenerator({
  baseUrl: 'http://localhost:4000/cubejs-api',
  output: './src/cube-types.ts',
  watch: false,
  watchDelay: 5000
});

await generator.run();
```

## Integration Workflow

### 1. Set Up Your Cube.js Server

Ensure your Cube.js server is running and accessible.

### 2. Generate Types

Run the code generator to create type definitions:

```bash
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts
```

### 3. Import Types in Your App

Import the generated types to register the global interface augmentation:

```typescript
import './cube-types';
```

### 4. Use with Full Type Safety

Now you have full autocompletion and type safety:

```typescript
const { data } = useCubeRecordQuery('orders', {
  measures: ['count'], // ✅ Autocompleted from your schema
  dimensions: ['status'], // ✅ Autocompleted from your schema
});

// data is fully typed based on your query
```

## Development Workflow

For development, use watch mode to automatically regenerate types when your Cube.js schema changes:

```bash
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts --watch
```

## Architecture

The generator uses a clean, modular architecture:

- **CodeGenerator**: Orchestrates the generation process
- **TypeGenerator**: Creates TypeScript AST nodes from cube definitions  
- **OutputWriter**: Handles file output operations
- **DefinitionRetriever**: Fetches metadata from Cube.js server

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Development Mode

```bash
pnpm dev
```

## Generated Type Structure

The generator creates types that match the structure expected by `@general-dexterity/cube-records`:

- **Cube names**: Converted to lowercase (e.g., `Orders` → `orders`)
- **Measures/Dimensions**: Simple `{ type: T }` format for easy type extraction
- **Joins**: Optional readonly arrays with lowercase join names
- **Module augmentation**: Extends the exported `CubeRecordMap` interface

This structure ensures perfect compatibility with the records package while providing excellent developer experience with full TypeScript autocompletion.