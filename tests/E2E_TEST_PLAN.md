# E2E Test Plan

## Overview
End-to-end tests for cube-records that validate the full workflow from Cube.js schemas to TypeScript type generation, type checking, and query execution.

## Prerequisites
- [ ] Cube.js server running at localhost:4000 (handled by CI or manual script)
- [ ] DuckDB database populated with test data

## Implementation Checklist

### 1. Test Infrastructure Setup
- [x] Create `tests/vitest.setup.ts` with database setup/teardown logic
- [x] Configure `tests/vitest.config.ts` for e2e tests
- [x] Add `test:e2e` script to parent `package.json`
  ```json
  "test:e2e": "vitest run --config tests/vitest.config.ts"
  ```

### 2. E2E Test Implementation
- [ ] Create `tests/e2e/codegen.test.ts` - Type generation tests
  - [ ] Generate types from Cube.js schemas
  - [ ] Verify generated type files exist
  - [ ] Validate type structure matches schema

- [ ] Create `tests/e2e/typecheck.test.ts` - TypeScript validation tests
  - [ ] Create test app that imports generated types
  - [ ] Use generated types with cube-records hooks
  - [ ] Run TypeScript compiler on test app
  - [ ] Verify no type errors

- [ ] Create `tests/e2e/queries.test.ts` - Query execution tests
  - [ ] Execute queries using generated types
  - [ ] Verify response data structure
  - [ ] Validate data types match TypeScript definitions
  - [ ] Test various query combinations (filters, dimensions, measures)

### 3. Test Data & Fixtures
- [x] Setup test data in `tests/seeds/` directory
- [x] Create database setup script (`tests/setup.sh`)
- [x] Create database teardown script (`tests/teardown.sh`)
- [ ] Create sample queries for testing

### 4. CI/CD Integration
- [ ] Document how to start Cube.js server for tests
- [ ] Add e2e tests to CI pipeline
- [ ] Configure test timeout settings

## Test Flow

```mermaid
graph LR
    A[Setup DB] --> B[Generate Types]
    B --> C[Create Test App]
    C --> D[TypeCheck]
    D --> E[Execute Queries]
    E --> F[Validate Results]
    F --> G[Teardown DB]
```

## Running Tests

### Local Development
```bash
# Start Cube.js server (separate terminal)
cd tests && docker-compose up

# Run e2e tests
pnpm test:e2e
```

### CI Environment
Tests assume Cube.js server is already running as part of CI setup.

## Notes
- Tests use vitest framework
- Database is recreated for each test run
- Generated types are validated against actual Cube.js responses
- Type safety is verified through TypeScript compilation