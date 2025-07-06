# Cube Records

A strongly-typed React hook wrapper for Cube.js that provides type-safe querying with full autocompletion support for measures, dimensions, filters, and joins.

## Features

- 🔒 **Full Type Safety**: Complete TypeScript integration with autocomplete for cube names, measures, and dimensions
- 🎯 **Simple API**: Clean, intuitive hook interface that mirrors Cube.js functionality
- 🔗 **Join Support**: Type-safe querying across joined cube models
- 🧹 **Clean Results**: Automatically removes cube name prefixes from result keys
- ⚡ **Zero Overhead**: Built directly on `@cubejs-client/react` with no performance impact
- 🔄 **Real-time**: Full support for live queries and data refresh

## Installation

```bash
npm install @general-dexterity/cube-records
# or
pnpm add @general-dexterity/cube-records
# or
yarn add @general-dexterity/cube-records
```

## Prerequisites

This package requires:
- `@cubejs-client/core` ^0.35.0
- `@cubejs-client/react` ^0.35.0  
- `react` ^18.0.0 || ^19.0.0

## Quick Start

### 1. Generate Types

Use the companion code generator to create TypeScript definitions from your Cube.js schema:

```bash
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts
```

This generates a type file that looks like:

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

### 2. Import Types in Your App

Import the generated types to enable full type safety:

```typescript
import { useCubeRecordQuery } from '@general-dexterity/cube-records';
import './cube-types'; // 🚨 Important: Import this to register types

function App() {
  const { data, isLoading } = useCubeRecordQuery('orders', {
    measures: ['count', 'total'],        // ✅ Full autocompletion
    dimensions: ['status', 'createdAt'], // ✅ Type-safe dimensions
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

### 3. Manual Type Declaration (Alternative)

If you prefer to declare types manually:

```typescript
// types/cube-records.ts
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

## API Reference

### `useCubeRecordQuery<CubeName>(cubeName, query)`

#### Parameters

- **`cubeName`**: The name of the cube (fully type-checked)
- **`query`**: Query configuration object with type-safe options

#### Query Configuration

```typescript
interface CubeRecordQueryParams<N extends CubeRecordName> {
  measures?: CubeRecordQueryMeasure<N>[];          // Type-safe measures
  dimensions?: CubeRecordQueryDimension<N>[];      // Type-safe dimensions  
  filters?: CubeRecordQueryFilter<N>[];            // Type-safe filters
  segments?: string[];                             // Cube segments
  timeDimensions?: TimeDimension[];                // Time-based dimensions
  limit?: number;                                  // Result limit
  offset?: number;                                 // Result offset
  order?: Record<string, 'asc' | 'desc'>;         // Ordering
  timezone?: string;                               // Timezone
  renewQuery?: boolean;                            // Force refresh
  ungrouped?: boolean;                             // Raw data mode
  total?: boolean;                                 // Include totals
}
```

#### Return Value

```typescript
interface CubeRecordQueryResult<N, M, D> {
  isLoading: boolean;                              // Loading state
  error?: Error;                                   // Error if any
  resultSet?: ResultSet;                           // Raw Cube.js result
  refetch: () => Promise<void>;                    // Refetch function
  data: CubeRecordQueryRow<N, M, D>[];            // Typed data array
  totalResultCount: number | null;                 // Total count
}
```

## Key Features

### 🎯 Full Type Safety & Autocompletion

Get complete IntelliSense support for everything:

```typescript
useCubeRecordQuery('orders', {
  measures: ['count', 'total'],     // ✅ Only valid measures
  dimensions: ['status'],           // ✅ Only valid dimensions
  
  // ❌ TypeScript errors for invalid fields
  measures: ['invalid'],            // Error: 'invalid' doesn't exist
  dimensions: ['badField'],         // Error: 'badField' doesn't exist
});
```

### 🔗 Type-Safe Joins

Query across joined cubes with full type safety:

```typescript
// If orders can join to users, you get autocompletion for joined fields
useCubeRecordQuery('orders', {
  measures: ['count', 'users.count'],           // ✅ Joined measures
  dimensions: ['status', 'users.name'],        // ✅ Joined dimensions
  filters: [{
    member: 'users.email',                      // ✅ Type-safe joined filters
    operator: 'contains',
    values: ['@example.com']
  }]
});
```

### 🧹 Clean Result Data

Results automatically remove cube prefixes for clean, intuitive data access:

```typescript
const { data } = useCubeRecordQuery('orders', {
  measures: ['count'],
  dimensions: ['status', 'users.name']  // Note: users.name from join
});

// Raw Cube.js result would be:
// { 'orders.count': 42, 'orders.status': 'pending', 'users.name': 'John' }

// Clean cube-records result:
// { count: 42, status: 'pending', name: 'John' }
```

### ⚡ Fully Typed Results

Results are automatically typed based on your query:

```typescript
const { data } = useCubeRecordQuery('orders', {
  measures: ['count', 'total'],
  dimensions: ['status', 'createdAt']
});

// `data` is automatically typed as:
// Array<{
//   count: number;      // From measures
//   total: number;      // From measures
//   status: string;     // From dimensions
//   createdAt: string;  // From dimensions
// }>
```

## Advanced Usage

### Complex Filters

```typescript
const { data } = useCubeRecordQuery('orders', {
  measures: ['count'],
  dimensions: ['status'],
  filters: [
    // Binary operators with values
    {
      member: 'createdAt',
      operator: 'inDateRange',
      values: ['2023-01-01', '2023-12-31']
    },
    // Unary operators (no values needed)
    {
      member: 'status',
      operator: 'set'
    }
  ]
});
```

### Time Dimensions

```typescript
const { data } = useCubeRecordQuery('orders', {
  measures: ['count'],
  timeDimensions: [{
    dimension: 'createdAt',
    granularity: 'month',
    dateRange: ['2023-01-01', '2023-12-31']
  }]
});
```

### Real-time Queries with Refresh

```typescript
const { data, refetch, isLoading } = useCubeRecordQuery('orders', {
  measures: ['count'],
  renewQuery: true  // Always fetch fresh data
});

const handleRefresh = () => {
  refetch(); // Manual refresh
};
```

### Pagination

```typescript
const { data, totalResultCount } = useCubeRecordQuery('orders', {
  measures: ['count'],
  dimensions: ['status'],
  limit: 20,
  offset: 40, // Page 3 (20 * 2)
  order: {
    'createdAt': 'desc'
  }
});
```

## Migration from Standard Cube.js

Migrating from standard `useCubeQuery` is straightforward:

```typescript
// Before (standard Cube.js)
const { resultSet } = useCubeQuery({
  measures: ['Orders.count', 'Orders.totalAmount'],
  dimensions: ['Orders.status', 'Users.name'],
  filters: [{
    member: 'Orders.status',
    operator: 'equals',
    values: ['pending']
  }]
});

const data = resultSet?.tablePivot() || [];

// After (cube-records)  
const { data } = useCubeRecordQuery('orders', {
  measures: ['count', 'totalAmount'],     // ✅ Clean, no prefixes
  dimensions: ['status', 'users.name'],   // ✅ Type-safe joins
  filters: [{
    member: 'status',                     // ✅ Simplified
    operator: 'equals',
    values: ['pending']
  }]
});
// ✅ Data is automatically processed and typed
```

## Best Practices

1. **Always Generate Types**: Use the code generator for the best experience
2. **Import Types**: Don't forget to import your generated type file
3. **Use TypeScript**: Enable strict mode for maximum type safety
4. **Handle Loading States**: Always check `isLoading` before using `data`
5. **Error Handling**: Check for `error` and handle appropriately
6. **Performance**: Use appropriate `limit` and `offset` for large datasets

## Example: Complete Analytics Dashboard

```typescript
import { useCubeRecordQuery } from '@general-dexterity/cube-records';
import './cube-types';

function OrdersDashboard() {
  // Type-safe query with joins
  const { data, isLoading, error } = useCubeRecordQuery('orders', {
    measures: ['count', 'total', 'users.count'],
    dimensions: ['status', 'users.name'],
    filters: [{
      member: 'createdAt',
      operator: 'inDateRange',
      values: ['2023-01-01', '2023-12-31']
    }],
    order: { total: 'desc' },
    limit: 100
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Orders Analytics</h1>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Order Count</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.name}</td>
              <td>{row.status}</td>
              <td>{row.count}</td>
              <td>${row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Troubleshooting

### "Property does not exist" errors

Make sure you've imported your type file:
```typescript
import './cube-types'; // Must import to register types
```

### No autocompletion

1. Ensure TypeScript is properly configured
2. Verify the generated types file is correct
3. Check that your IDE supports TypeScript IntelliSense

### Join fields not working

1. Verify joins are defined in your type definitions
2. Check that the join relationship exists in your Cube.js schema
3. Ensure joined cube names are lowercase in the type definitions

## License

MIT