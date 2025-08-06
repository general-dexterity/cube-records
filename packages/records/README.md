# @general-dexterity/cube-records

Type-safe React hooks for Cube.js that provide autocompletion and simplified data access.

## Purpose

This package wraps Cube.js React hooks to provide:
- Full TypeScript autocompletion for cube names, measures, and dimensions
- Simplified result data without cube name prefixes
- Type-safe joins across cube models
- Zero runtime overhead
- Advanced utility types for type-safe data manipulation

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

## Advanced Features

### Type-Safe Order Parameter

The `order` parameter in queries now only accepts valid measures and dimensions from your cube:

```typescript
import { useCubeRecordQuery } from '@general-dexterity/cube-records';

const { data } = useCubeRecordQuery({
  model: 'orders',
  query: {
    measures: ['count', 'total'],
    dimensions: ['status', 'created_at'],
    order: {
      count: 'desc',        // ✓ Valid measure
      status: 'asc',        // ✓ Valid dimension
      created_at: 'desc',   // ✓ Valid dimension
      // invalid: 'asc',    // ✗ Type error - field doesn't exist
    },
  },
});
```

### Time Dimension Filtering

The generated types now include `__cubetype` metadata that enables filtering for time dimensions and the `timeDimensions` parameter now only accepts dimensions with time type:

```typescript
import type { CubeRecordQueryTimeDimension } from '@general-dexterity/cube-records';
import { useCubeRecordQuery } from '@general-dexterity/cube-records';

// Get only time dimensions from a cube
type OrderTimeDimensions = CubeRecordQueryTimeDimension<'orders'>;
// Result: 'order_date' | 'created_at' | ...

// Use in queries - only time dimensions are allowed
const { data } = useCubeRecordQuery({
  model: 'orders',
  query: {
    timeDimensions: [{
      dimension: 'order_date',    // ✓ Valid - time dimension
      // dimension: 'status',      // ✗ Type error - not a time dimension
      granularity: 'day',
      dateRange: 'last 7 days',
    }],
  },
});
```

### String Field Utilities

Extract and work with string-typed fields for type-safe grouping operations:

```typescript
import type { 
  StringFields, 
  PickStringFields,
  GroupByKey 
} from '@general-dexterity/cube-records';

// Get string field names from a query result
type Row = CubeRecordQueryRow<'orders', ['count'], ['status', 'id']>;
type StringKeys = StringFields<Row>; // 'status'

// Use with groupBy functions
function groupBy<T, K extends GroupByKey<T>>(
  data: T[],
  key: K
): Partial<Record<T[K] extends string ? T[K] : never, T[]>> {
  // Implementation
}

// Type-safe: only allows string fields
const grouped = groupBy(results, 'status'); // ✓ Works
const grouped = groupBy(results, 'id');     // ✗ Type error (id is number)
```

### Smart Measure Type Inference

Automatically infers the correct type for measures:

```typescript
import type { 
  CubeRecordQueryMeasureType,
  CubeRecordQueryRowEnhanced 
} from '@general-dexterity/cube-records';

// If all measures are numbers, returns number
type OrderMeasureType = CubeRecordQueryMeasureType<'orders'>; // number

// If measures have mixed types, returns union
type MixedMeasureType = CubeRecordQueryMeasureType<'mixedCube'>; // number | string

// Enhanced row type uses smart inference for better DX
type EnhancedRow = CubeRecordQueryRowEnhanced<
  'orders',
  ['count', 'total'],
  ['status']
>;
// When all measures are numbers, they're all typed as number
// This provides better type inference for generic functions
```

### Number Field Utilities

Similar utilities for number-typed fields:

```typescript
import type { 
  NumberFields, 
  PickNumberFields 
} from '@general-dexterity/cube-records';

// Extract numeric fields for calculations
type NumericFields = PickNumberFields<Row>;
```

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
