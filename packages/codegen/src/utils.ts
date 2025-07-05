import ts from 'typescript';
import type { DimensionType } from './cube';

export const dimensionTypeToTsType = (type: DimensionType) => {
  switch (type) {
    case 'number':
      return ts.SyntaxKind.NumberKeyword;
    case 'string':
    case 'time':
      return ts.SyntaxKind.StringKeyword;
    case 'boolean':
      return ts.SyntaxKind.BooleanKeyword;
    default:
      throw new Error(`Unknown dimension type: ${type}`);
  }
};

export const cubeTitleToTsInterfaceName = (title: string) => {
  // Convert the title to PascalCase for TypeScript interface naming

  return pascal(title);
};

export const cubeMeasureToPropertyName = (measure: string) => {
  return measure.split('.')[1];
};

export const isNil = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

const PART_PATTERN = /[.\-\s_]/;
/**
 * Formats the given string in pascal case fashion
 *
 * pascal('hello world') -> 'HelloWorld'
 * pascal('va va boom') -> 'VaVaBoom'
 */
export const pascal = (str: string): string => {
  const parts = str?.split(PART_PATTERN).map((x) => x.toLowerCase()) ?? [];
  if (parts.length === 0) {
    return '';
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};
