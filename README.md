# Cube Records

A TypeScript-first toolkit that provides opinionated ways to work with Cube.js models and views by abstracting them as records. It includes React hooks wrappers and code generation to enhance the developer experience with full type safety.

## Packages

- **[@general-dexterity/cube-records](./packages/records)** - React hooks with type-safe wrappers around Cube.js
- **[@general-dexterity/cube-records-codegen](./packages/codegen)** - CLI tool for generating TypeScript definitions from your Cube.js schema

## Example

Assuming you have these two Cube.js models:

```yaml
# schema/stores.yml
cubes:
  - name: stores
    sql: SELECT * FROM stores

    measures:
      - name: count
        type: count

    dimensions:
      - name: id
        sql: id
        type: string
        primary_key: true

      - name: name
        sql: name
        type: string

      - name: city
        sql: city
        type: string

# schema/orders.yml
cubes:
  - name: orders
    sql: SELECT * FROM orders

    joins:
      - name: stores
        sql: "{CUBE}.store_id = {stores}.id"
        relationship: one_to_one

    measures:
      - name: count
        type: count

      - name: total_amount
        sql: amount
        type: sum

    dimensions:
      - name: id
        sql: id
        type: string
        primary_key: true

      - name: status
        sql: status
        type: string

      - name: created_at
        sql: created_at
        type: time
```

### 1. Generate TypeScript definitions

```bash
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts
```

### 2. Use the type-safe hooks in your React app

```typescript
import { useCubeRecordQuery } from '@general-dexterity/cube-records';
import './cube-types'; // Import generated types

function OrderAnalytics() {
  const { data, isLoading } = useCubeRecordQuery({
    model: 'orders',
    query: {
      measures: ['count', 'total_amount'],
      dimensions: ['status', 'stores.name', 'stores.city'],
      filters: [{
        member: 'created_at',
        operator: 'inDateRange',
        values: ['2024-01-01', '2024-12-31']
      }],
      order: {
        total_amount: 'desc'
      }
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data.map((row, i) => (
        <li key={i}>
          {/* Each row has the shape:
            {
              count: number,
              total_amount: number,
              status: string,
              name: string,      // from stores.name
              city: string       // from stores.city
            }
          */}
          {row.name} ({row.city}): {row.count} orders - ${row.total_amount}
        </li>
      ))}
    </ul>
  );
}
```

## Getting Started

See individual package READMEs for detailed setup and usage instructions:
- [React Hooks Documentation](./packages/records/README.md)
- [Code Generator Documentation](./packages/codegen/README.md)
