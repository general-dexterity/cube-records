import { describe, it, expectTypeOf } from 'vitest';
import type {
  CubeRecordQueryRow,
  CubeRecordQueryRowEnhanced,
  CubeRecordQueryMeasureType,
} from '../src/types';

// Mock CubeRecordMap for testing
declare module '../src/types' {
  interface CubeRecordMap {
    allNumberMeasures: {
      measures: {
        count: { type: number; __cubetype?: 'number' };
        total: { type: number; __cubetype?: 'number' };
        average: { type: number; __cubetype?: 'number' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
        name: { type: string; __cubetype: 'string' };
      };
      joins?: [];
    };
    allStringMeasures: {
      measures: {
        label: { type: string; __cubetype?: 'string' };
        description: { type: string; __cubetype?: 'string' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
      };
      joins?: [];
    };
    mixedMeasures: {
      measures: {
        count: { type: number; __cubetype?: 'number' };
        label: { type: string; __cubetype?: 'string' };
        amount: { type: number; __cubetype?: 'number' };
      };
      dimensions: {
        id: { type: number; __cubetype: 'number' };
      };
      joins?: [];
    };
  }
}

describe('Enhanced Row Type with Smart Measure Inference', () => {
  it('infers number for all-number measures', () => {
    // Check that the measure type is correctly inferred as number
    type MeasureType = CubeRecordQueryMeasureType<'allNumberMeasures'>;
    expectTypeOf<MeasureType>().toEqualTypeOf<number>();

    // Standard row type - each measure has its specific type
    type StandardRow = CubeRecordQueryRow<
      'allNumberMeasures',
      ['count', 'total'],
      ['name']
    >;
    expectTypeOf<StandardRow>().toEqualTypeOf<{
      count: number;
      total: number;
      name: string;
    }>();

    // Enhanced row type - all measures are inferred as number
    type EnhancedRow = CubeRecordQueryRowEnhanced<
      'allNumberMeasures',
      ['count', 'total'],
      ['name']
    >;
    expectTypeOf<EnhancedRow>().toEqualTypeOf<{
      count: number;
      total: number;
      name: string;
    }>();
  });

  it('infers string for all-string measures', () => {
    // Check that the measure type is correctly inferred as string
    type MeasureType = CubeRecordQueryMeasureType<'allStringMeasures'>;
    expectTypeOf<MeasureType>().toEqualTypeOf<string>();

    // Enhanced row type - all measures are inferred as string
    type EnhancedRow = CubeRecordQueryRowEnhanced<
      'allStringMeasures',
      ['label', 'description'],
      ['id']
    >;
    expectTypeOf<EnhancedRow>().toEqualTypeOf<{
      label: string;
      description: string;
      id: number;
    }>();
  });

  it('uses specific types for mixed measures', () => {
    // Check that the measure type is a union for mixed types
    type MeasureType = CubeRecordQueryMeasureType<'mixedMeasures'>;
    expectTypeOf<MeasureType>().toEqualTypeOf<number | string>();

    // Enhanced row type - falls back to specific types for each measure
    type EnhancedRow = CubeRecordQueryRowEnhanced<
      'mixedMeasures',
      ['count', 'label', 'amount'],
      ['id']
    >;
    expectTypeOf<EnhancedRow>().toEqualTypeOf<{
      count: number;
      label: string;
      amount: number;
      id: number;
    }>();
  });

  it('handles empty measures array', () => {
    type EnhancedRow = CubeRecordQueryRowEnhanced<
      'allNumberMeasures',
      [],
      ['name', 'id']
    >;
    expectTypeOf<EnhancedRow>().toEqualTypeOf<{
      name: string;
      id: number;
    }>();
  });

  it('handles empty dimensions array', () => {
    type EnhancedRow = CubeRecordQueryRowEnhanced<
      'allNumberMeasures',
      ['count', 'total'],
      []
    >;
    expectTypeOf<EnhancedRow>().toEqualTypeOf<{
      count: number;
      total: number;
    }>();
  });

  it('works with both enhanced and standard row types', () => {
    // Both types should be compatible when the inference matches
    type StandardRow = CubeRecordQueryRow<
      'allNumberMeasures',
      ['count'],
      ['name']
    >;
    type EnhancedRow = CubeRecordQueryRowEnhanced<
      'allNumberMeasures',
      ['count'],
      ['name']
    >;

    // They should be assignable to each other
    const standard: StandardRow = { count: 42, name: 'test' };
    const enhanced: EnhancedRow = { count: 42, name: 'test' };

    expectTypeOf<StandardRow>().toMatchTypeOf<EnhancedRow>();
    expectTypeOf<EnhancedRow>().toMatchTypeOf<StandardRow>();
  });
});