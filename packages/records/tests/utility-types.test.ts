import { describe, expectTypeOf, it } from 'vitest';
import type {
  CubeRecordQueryMeasureType,
  CubeRecordQueryRow,
  CubeRecordQueryTimeDimension,
  GroupByKey,
  NumberFields,
  PickNumberFields,
  PickStringFields,
  StringFields,
} from '../src/types';

// Mock CubeRecordMap for testing
declare module '../src/types' {
  interface CubeRecordMap {
    testCube: {
      measures: {
        count: { type: number; __cubetype?: 'number' };
        total: { type: number; __cubetype?: 'number' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
        name: { type: string; __cubetype: 'string' };
        created_at: { type: string; __cubetype: 'time' };
        updated_at: { type: string; __cubetype: 'time' };
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
        timestamp: { type: string; __cubetype: 'time' };
        description: { type: string; __cubetype: 'string' };
      };
      joins?: [];
    };
    mixedMeasuresCube: {
      measures: {
        count: { type: number; __cubetype?: 'number' };
        label: { type: string; __cubetype?: 'string' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
      };
      joins?: [];
    };
  }
}

describe('Utility Types', () => {
  describe('Time Dimension Filtering', () => {
    it('extracts time dimensions from a cube', () => {
      type TimeDims = CubeRecordQueryTimeDimension<'testCube'>;
      expectTypeOf<TimeDims>().toEqualTypeOf<
        'created_at' | 'updated_at' | 'relatedCube.timestamp'
      >();
    });

    it('extracts time dimensions from cubes without joins', () => {
      type TimeDims = CubeRecordQueryTimeDimension<'relatedCube'>;
      expectTypeOf<TimeDims>().toEqualTypeOf<'timestamp'>();
    });
  });

  describe('String Field Utilities', () => {
    it('extracts string field names from a type', () => {
      type TestType = {
        id: number;
        name: string;
        email: string;
        age: number;
        isActive: boolean;
      };

      type StringFieldNames = StringFields<TestType>;
      expectTypeOf<StringFieldNames>().toEqualTypeOf<'name' | 'email'>();
    });

    it('picks only string fields from a type', () => {
      type TestType = {
        id: number;
        name: string;
        email: string;
        age: number;
      };

      type StringOnlyType = PickStringFields<TestType>;
      expectTypeOf<StringOnlyType>().toEqualTypeOf<{
        name: string;
        email: string;
      }>();
    });

    it('works with CubeRecordQueryRow for groupBy', () => {
      type Row = CubeRecordQueryRow<
        'testCube',
        ['count'],
        ['name', 'status', 'id']
      >;

      type GroupKeys = GroupByKey<Row>;
      expectTypeOf<GroupKeys>().toEqualTypeOf<'name' | 'status'>();
    });
  });

  describe('Number Field Utilities', () => {
    it('extracts number field names from a type', () => {
      type TestType = {
        id: number;
        name: string;
        count: number;
        price: number;
      };

      type NumberFieldNames = NumberFields<TestType>;
      expectTypeOf<NumberFieldNames>().toEqualTypeOf<
        'id' | 'count' | 'price'
      >();
    });

    it('picks only number fields from a type', () => {
      type TestType = {
        id: number;
        name: string;
        count: number;
        isActive: boolean;
      };

      type NumberOnlyType = PickNumberFields<TestType>;
      expectTypeOf<NumberOnlyType>().toEqualTypeOf<{
        id: number;
        count: number;
      }>();
    });
  });

  describe('Smart Measure Type Inference', () => {
    it('infers number when all measures are numbers', () => {
      type MeasureType = CubeRecordQueryMeasureType<'testCube'>;
      expectTypeOf<MeasureType>().toEqualTypeOf<number>();
    });

    it('infers union type when measures have mixed types', () => {
      type MeasureType = CubeRecordQueryMeasureType<'mixedMeasuresCube'>;
      expectTypeOf<MeasureType>().toEqualTypeOf<number | string>();
    });
  });

  describe('Integration with groupBy function', () => {
    it('allows grouping by string fields only', () => {
      function groupBy<T, K extends StringFields<T>>(
        arr: T[],
        key: K
      ): Partial<Record<T[K] extends string ? T[K] : never, T[]>> {
        const result: Record<string, T[]> = {};
        for (const item of arr) {
          const groupKey = String(item[key]);
          if (!result[groupKey]) {
            result[groupKey] = [];
          }
          result[groupKey].push(item);
        }
        return result;
      }

      type Row = CubeRecordQueryRow<
        'testCube',
        ['count'],
        ['name', 'status', 'id']
      >;

      const mockData: Row[] = [
        { count: 1, name: 'A', status: 'active', id: 1 },
        { count: 2, name: 'B', status: 'active', id: 2 },
        { count: 3, name: 'A', status: 'inactive', id: 3 },
      ];

      // These should work
      const byName = groupBy(mockData, 'name');
      const byStatus = groupBy(mockData, 'status');

      // This should cause a type error (id is number, not string)
      // @ts-expect-error - id is not a string field
      const _byId = groupBy(mockData, 'id');

      expectTypeOf(byName).toMatchTypeOf<Partial<Record<string, Row[]>>>();
      expectTypeOf(byStatus).toMatchTypeOf<Partial<Record<string, Row[]>>>();
    });
  });
});
