import { describe, it, expectTypeOf } from 'vitest';
import type {
  CubeRecordOrder,
  CubeRecordQueryParams,
} from '../src/use-cube-record-query';

// Mock CubeRecordMap for testing
declare module '../src/types' {
  interface CubeRecordMap {
    orderTestCube: {
      measures: {
        count: { type: number; __cubetype?: 'number' };
        total: { type: number; __cubetype?: 'number' };
        average: { type: number; __cubetype?: 'number' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
        name: { type: string; __cubetype: 'string' };
        created_at: { type: string; __cubetype: 'time' };
        status: { type: string; __cubetype: 'string' };
      };
      joins?: ['relatedCube'];
    };
    relatedCube: {
      measures: {
        amount: { type: number; __cubetype?: 'number' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
        category: { type: string; __cubetype: 'string' };
      };
      joins?: [];
    };
  }
}

describe('Order Type', () => {
  it('accepts valid measures and dimensions from the cube', () => {
    type OrderType = CubeRecordOrder<'orderTestCube'>;
    
    // These should all be valid
    const validOrder: OrderType = {
      count: 'asc',
      total: 'desc',
      id: 'asc',
      name: 'desc',
      created_at: 'asc',
      status: 'desc',
    };

    expectTypeOf(validOrder).toMatchTypeOf<OrderType>();
  });

  it('accepts joined measures and dimensions', () => {
    type OrderType = CubeRecordOrder<'orderTestCube'>;
    
    const orderWithJoins: OrderType = {
      count: 'asc',
      'relatedCube.amount': 'desc',
      'relatedCube.category': 'asc',
      'relatedCube.id': 'desc',
    };

    expectTypeOf(orderWithJoins).toMatchTypeOf<OrderType>();
  });

  it('only accepts asc or desc as values', () => {
    type OrderType = CubeRecordOrder<'orderTestCube'>;
    
    // @ts-expect-error - invalid sort direction
    const invalidOrder: OrderType = {
      count: 'invalid',
    };

    // Valid directions
    const validOrder: OrderType = {
      count: 'asc',
      total: 'desc',
    };

    expectTypeOf(validOrder).toMatchTypeOf<OrderType>();
  });

  it('works with CubeRecordQueryParams', () => {
    type QueryParams = CubeRecordQueryParams<'orderTestCube'>;
    
    const query: QueryParams = {
      measures: ['count', 'total'],
      dimensions: ['name', 'status'],
      order: {
        count: 'desc',
        name: 'asc',
        'relatedCube.amount': 'desc',
      },
      limit: 10,
    };

    expectTypeOf(query).toMatchTypeOf<QueryParams>();
  });

  it('prevents ordering by non-existent fields', () => {
    type OrderType = CubeRecordOrder<'orderTestCube'>;
    
    const order: OrderType = {
      // @ts-expect-error - non_existent_field doesn't exist
      non_existent_field: 'asc',
      // Valid field
      count: 'desc',
    };

    // The valid part should still work
    const validPart: OrderType = {
      count: 'desc',
    };
    expectTypeOf(validPart).toMatchTypeOf<OrderType>();
  });

  it('is optional in query params', () => {
    type QueryParams = CubeRecordQueryParams<'orderTestCube'>;
    
    // Query without order is valid
    const queryWithoutOrder: QueryParams = {
      measures: ['count'],
      dimensions: ['name'],
    };

    // Query with order is valid
    const queryWithOrder: QueryParams = {
      measures: ['count'],
      dimensions: ['name'],
      order: {
        count: 'desc',
      },
    };

    expectTypeOf(queryWithoutOrder).toMatchTypeOf<QueryParams>();
    expectTypeOf(queryWithOrder).toMatchTypeOf<QueryParams>();
  });
});