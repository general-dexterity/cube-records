import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cubeMeasureToPropertyName,
  cubeTitleToTsInterfaceName,
  dimensionTypeToTsType,
  isNil,
  pascal,
} from './utils';



describe('dimensionTypeToTsType', () => {
  it('converts number type correctly', () => {
    expect(dimensionTypeToTsType('number')).toBe(ts.SyntaxKind.NumberKeyword);
  });

  it('converts string type correctly', () => {
    expect(dimensionTypeToTsType('string')).toBe(ts.SyntaxKind.StringKeyword);
  });

  it('converts time type to string', () => {
    expect(dimensionTypeToTsType('time')).toBe(ts.SyntaxKind.StringKeyword);
  });

  it('converts boolean type correctly', () => {
    expect(dimensionTypeToTsType('boolean')).toBe(ts.SyntaxKind.BooleanKeyword);
  });

  it('throws error for unknown type', () => {
    // biome-ignore lint/suspicious/noExplicitAny: Testing error handling for invalid types
    expect(() => dimensionTypeToTsType('unknown' as any)).toThrow(
      'Unknown dimension type: unknown'
    );
  });
});

describe('cubeTitleToTsInterfaceName', () => {
  it('converts simple title to PascalCase', () => {
    expect(cubeTitleToTsInterfaceName('orders')).toBe('Orders');
  });

  it('converts multi-word title to PascalCase', () => {
    expect(cubeTitleToTsInterfaceName('order items')).toBe('OrderItems');
  });

  it('handles titles with special characters', () => {
    expect(cubeTitleToTsInterfaceName('order-items')).toBe('OrderItems');
    expect(cubeTitleToTsInterfaceName('order_items')).toBe('OrderItems');
    expect(cubeTitleToTsInterfaceName('order.items')).toBe('OrderItems');
  });

  it('handles empty string', () => {
    expect(cubeTitleToTsInterfaceName('')).toBe('');
  });
});

describe('cubeMeasureToPropertyName', () => {
  it('extracts property name from cube measure', () => {
    expect(cubeMeasureToPropertyName('Orders.count')).toBe('count');
  });

  it('extracts property name from cube dimension', () => {
    expect(cubeMeasureToPropertyName('Orders.status')).toBe('status');
  });

  it('handles names with multiple dots', () => {
    expect(cubeMeasureToPropertyName('Schema.Orders.count')).toBe('Orders');
  });

  it('returns undefined for names without dots', () => {
    expect(cubeMeasureToPropertyName('count')).toBe(undefined);
  });
});

describe('isNil', () => {
  it('returns true for null', () => {
    expect(isNil(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isNil(undefined)).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isNil('')).toBe(false);
  });

  it('returns false for zero', () => {
    expect(isNil(0)).toBe(false);
  });

  it('returns false for false', () => {
    expect(isNil(false)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isNil([])).toBe(false);
  });

  it('returns false for empty object', () => {
    expect(isNil({})).toBe(false);
  });
});

describe('pascal', () => {
  it('converts simple string to PascalCase', () => {
    expect(pascal('hello')).toBe('Hello');
  });

  it('converts multi-word string with spaces', () => {
    expect(pascal('hello world')).toBe('HelloWorld');
  });

  it('converts multi-word string with hyphens', () => {
    expect(pascal('hello-world')).toBe('HelloWorld');
  });

  it('converts multi-word string with underscores', () => {
    expect(pascal('hello_world')).toBe('HelloWorld');
  });

  it('converts multi-word string with dots', () => {
    expect(pascal('hello.world')).toBe('HelloWorld');
  });

  it('handles mixed separators', () => {
    expect(pascal('hello-world_foo.bar')).toBe('HelloWorldFooBar');
  });

  it('handles already capitalized words', () => {
    expect(pascal('Hello World')).toBe('HelloWorld');
  });

  it('handles empty string', () => {
    expect(pascal('')).toBe('');
  });

  it('handles single character', () => {
    expect(pascal('a')).toBe('A');
  });

  it('handles multiple consecutive separators', () => {
    expect(pascal('hello--world')).toBe('HelloWorld');
  });

  it('handles leading and trailing separators', () => {
    expect(pascal('-hello-world-')).toBe('HelloWorld');
  });

  it('converts example from comment', () => {
    expect(pascal('va va boom')).toBe('VaVaBoom');
  });
});
