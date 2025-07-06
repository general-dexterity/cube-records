# Cube Records

A comprehensive TypeScript toolkit for Cube.js that provides type-safe querying and automatic code generation for your cube models.

## 🎯 What is Cube Records?

Cube Records transforms your Cube.js experience by providing:

- **🔧 CLI Tool**: Auto-generates TypeScript definitions from your cube schema
- **🎣 React Hook**: Type-safe wrapper around `useCubeQuery` with full IntelliSense support (exported as `useCubeRecordQuery`)
- **🔗 Join Support**: Seamless querying across joined cube models
- **✨ Clean API**: Removes cube name prefixes and provides a simplified interface

## 📦 Packages

This monorepo contains:

- **[`@general-dexterity/cube-records`](./packages/records)**: The main React hook library
- **[`@general-dexterity/cube-records-codegen`](./packages/codegen)**: CLI tool for generating TypeScript definitions

## 🚀 Quick Start

### Step 1: Install the Package

```bash
npm install @general-dexterity/cube-records
# or
pnpm add @general-dexterity/cube-records
# or
yarn add @general-dexterity/cube-records
```

### Step 2: Generate Types from Your Cube Schema

Use the CLI to auto-generate TypeScript definitions:

```bash
# Generate from local Cube.js instance
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api

# Generate to specific file
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts

# Watch mode for development
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts --watch
```

This creates a TypeScript file with your cube model definitions:

```typescript
// Generated cube-types.ts
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

### Step 3: Import and Use the Generated Types

Import the generated types in your main app file:

```typescript
// src/main.tsx or src/App.tsx
import './cube-types'; // This registers the module augmentation
```

### Step 4: Use the Type-Safe Hook

Now you can use the `useCubeRecordQuery` hook with full type safety:

```typescript
import React from 'react';
import { useCubeRecordQuery } from '@general-dexterity/cube-records';

export function UserAnalytics() {
  const { data, isLoading, error } = useCubeRecordQuery('users', {
    // ✅ TypeScript provides autocomplete for all valid measures
    measures: ['count', 'averageAge'],

    // ✅ Includes dimensions from the main cube and joined cubes
    dimensions: ['name', 'email', 'orders.status', 'user_profiles.bio'],

    // ✅ Type-safe filters with full IntelliSense
    filters: [{
      member: 'orders.status',           // Autocomplete shows valid options
      operator: 'equals',
      values: ['completed', 'shipped']
    }, {
      member: 'createdAt',
      operator: 'inDateRange',
      values: ['2023-01-01', '2023-12-31']
    }],

    // ✅ Type-safe ordering
    order: {
      'orders.totalRevenue': 'desc',
      'name': 'asc'
    },

    limit: 100,
    offset: 0
  });

  if (isLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className="analytics">
      <h2>User Analytics</h2>
      <div className="stats">
        <p>Total Results: {data.length}</p>
      </div>

      <div className="results">
        {data.map((user, index) => (
          <div key={index} className="user-card">
            {/* ✅ All properties are fully typed with no cube prefixes */}
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
            <p>Order Status: {user.status}</p>
            <p>Bio: {user.bio}</p>
            <p>Count: {user.count}</p>
            <p>Average Age: {user.averageAge}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 CLI Usage

The `@general-dexterity/cube-records-codegen` CLI provides type generation for your cube models:

### Generate Command

```bash
npx @general-dexterity/cube-records-codegen [options]
```

**Options:**
- `--baseUrl <url>`: URL to your Cube.js API (default: `http://localhost:4000/cubejs-api`)
- `--output <file>`: Output file path (default: stdout)
- `--watch`: Enable watch mode for continuous updates
- `--duration <ms>`: Polling interval in milliseconds for watch mode (default: 5000)
- `--help`: Show help information

**Examples:**

```bash
# Basic usage with local development server
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api

# Generate to specific file
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts

# Watch mode for development
npx @general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/cube-types.ts --watch
```

### Version Command

```bash
npx @general-dexterity/cube-records-codegen --version
```

### Help Command

```bash
npx @general-dexterity/cube-records-codegen --help
```

## 🏗️ Development Workflow

Here's a recommended workflow for using Cube Records in your project:

### 1. Setup Script

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "cube:generate": "@general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api --output ./src/types/cube-models.ts",
    "cube:generate:prod": "@general-dexterity/cube-records-codegen --baseUrl $CUBE_API_URL --output ./src/types/cube-models.ts",
    "dev": "@general-dexterity/cube-records-codegen --baseUrl http://localhost:4000/cubejs-api && vite dev"
  }
}
```

### 2. Environment Variables

Create a `.env` file for your Cube.js configuration:

```bash
# .env
CUBE_API_URL=http://localhost:4000/cubejs-api

# .env.production
CUBE_API_URL=https://your-production-cube-api.com/cubejs-api
```

### 3. CI/CD Integration

Add type generation to your CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Generate Cube types
        run: npm run cube:generate:prod
        env:
          CUBE_API_URL: ${{ secrets.CUBE_API_URL }}

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test
```

## 🎯 Advanced Examples

### Complex Analytics Dashboard

```typescript
import { useCubeRecordQuery } from '@general-dexterity/cube-records';

export function SalesAnalytics() {
  // Revenue analysis with multiple joins
  const { data: revenueData } = useCubeRecordQuery('orders', {
    measures: ['totalRevenue', 'count', 'averageOrderValue'],
    dimensions: ['status', 'users.name', 'products.category'],
    filters: [{
      member: 'createdAt',
      operator: 'inDateRange',
      values: ['2023-01-01', '2023-12-31']
    }],
    order: { 'totalRevenue': 'desc' },
    limit: 50
  });

  // Time-based analysis
  const { data: timeData } = useCubeRecordQuery('orders', {
    measures: ['totalRevenue'],
    timeDimensions: [{
      dimension: 'createdAt',
      granularity: 'month',
      dateRange: ['2023-01-01', '2023-12-31']
    }]
  });

  // User segmentation
  const { data: userSegments } = useCubeRecordQuery('users', {
    measures: ['count'],
    dimensions: ['segment', 'orders.status'],
    filters: [{
      member: 'orders.totalRevenue',
      operator: 'gt',
      values: ['1000']
    }]
  });

  return (
    <div className="analytics-dashboard">
      {/* All data is fully typed */}
      <RevenueChart data={revenueData} />
      <TimeChart data={timeData} />
      <SegmentChart data={userSegments} />
    </div>
  );
}
```

### Real-time Monitoring

```typescript
export function RealTimeMetrics() {
  const { data, refetch } = useCubeRecordQuery('orders', {
    measures: ['count', 'totalRevenue'],
    dimensions: ['status'],
    filters: [{
      member: 'createdAt',
      operator: 'inDateRange',
      values: ['today']
    }],
    renewQuery: true // Always fetch fresh data
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="real-time-metrics">
      {data.map(metric => (
        <MetricCard
          key={metric.status}
          status={metric.status}
          count={metric.count}
          revenue={metric.totalRevenue}
        />
      ))}
    </div>
  );
}
```

## 🔧 Configuration

### TypeScript Configuration

Ensure your `tsconfig.json` includes the generated types:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "src/types/cube-models.ts"  // Include generated types
  ]
}
```

### Cube.js Configuration

Make sure your Cube.js API is properly configured for schema introspection:

```javascript
// cube.js
module.exports = {
  // Enable CORS for development
  http: {
    cors: {
      origin: '*',
      credentials: true
    }
  },

  // Enable schema endpoint
  schemaPath: 'schema',

  // Your other Cube.js configuration...
};
```

## 📚 API Reference

### CLI Commands

| Command | Description | Options |
|---------|-------------|---------|
| `generate` | Generate TypeScript types from Cube schema | `--baseUrl`, `--output`, `--watch`, `--duration` |
| `--version` | Show version information | - |
| `--help` | Show help information | - |

### Hook API

```typescript
useCubeRecordQuery<CubeName>(cubeName: CubeName, query: QueryParams): QueryResult
```

See the [records package README](./packages/records/README.md) for detailed API documentation.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/general-dexterity/cube-records.git
cd cube-records

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start development mode
pnpm dev
```

### Package Structure

```
packages/
├── records/          # Main React hook library
│   ├── src/
│   │   ├── types.ts
│   │   ├── use-cube-record-query.ts
│   │   └── index.ts
│   └── package.json
│
└── codegen/          # CLI code generation tool
    ├── src/
    │   ├── cli/
    │   ├── generators/
    │   └── index.ts
    └── package.json
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built on top of [Cube.js](https://cube.dev/) - the amazing headless BI platform
- Inspired by the need for better TypeScript support in cube analytics
- Thanks to all contributors who help make this project better

---

**Happy analyzing! 📊✨**
