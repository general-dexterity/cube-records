/**
 * Base interface for defining a CubeRecord.
 */
export interface CubeRecordDefinition {
  name: string;
  measures: Record<string, { type: unknown; __cubetype?: string }>;
  dimensions: Record<string, { type: unknown; __cubetype?: string }>;
  joins?: readonly string[];
  segments?: readonly string[];
}

/**
 * Global interface that should be extended by users to define their cube records.
 * Users should declare this interface in their project:
 *
 * declare global {
 *   interface CubeRecordMap {
 *     users: {
 *       measures: { count: { type: number } };
 *       dimensions: { id: { type: string } };
 *       joins: readonly ['orders'];
 *     };
 *   }
 * }
 */

// biome-ignore lint/suspicious/noEmptyInterface: To allow users to extend this interface.
export interface CubeRecordMap {
  __empty: {
    measures: {};
    dimensions: {};
    joins: [];
  };
}

/**
 * Type for cube record names
 */
export type CubeRecordName = keyof CubeRecordMap;

/**
 * Extracts measure names from a specific cube record
 */
type CubeRecordMeasure<T extends CubeRecordName> =
  keyof CubeRecordMap[T]['measures'] & string;

/**
 * Extracts dimension names from a specific cube record
 */
type CubeRecordDimension<T extends CubeRecordName> =
  keyof CubeRecordMap[T]['dimensions'] & string;

/**
 * Creates measure names from joined cube records
 */
type JoinedCubeRecordMeasure<T extends CubeRecordName> =
  T extends CubeRecordName
    ? CubeRecordMap[T]['joins'] extends infer J
      ? J extends readonly string[]
        ? J[number] extends infer JoinName
          ? JoinName extends CubeRecordName
            ? `${JoinName}.${keyof CubeRecordMap[JoinName]['measures'] & string}`
            : never
          : never
        : never
      : never
    : never;

/**
 * Creates dimension names from joined cube records
 */
type JoinedCubeRecordDimension<T extends CubeRecordName> =
  T extends CubeRecordName
    ? CubeRecordMap[T]['joins'] extends infer J
      ? J extends readonly string[]
        ? J[number] extends infer JoinName
          ? JoinName extends CubeRecordName
            ? `${JoinName}.${keyof CubeRecordMap[JoinName]['dimensions'] & string}`
            : never
          : never
        : never
      : never
    : never;

/**
 * Type for measures of a specific cube record, including joined measures
 */
export type CubeRecordQueryMeasure<N extends CubeRecordName> =
  | CubeRecordMeasure<N>
  | JoinedCubeRecordMeasure<N>;

/**
 * Type for dimensions of a specific cube record, including joined dimensions
 */
export type CubeRecordQueryDimension<N extends CubeRecordName> =
  | CubeRecordDimension<N>
  | JoinedCubeRecordDimension<N>;

/**
 * Type for all attributes (measures and dimensions) of a cube record
 */
export type CubeRecordAttribute<N extends CubeRecordName> =
  | CubeRecordQueryMeasure<N>
  | CubeRecordQueryDimension<N>;

/**
 * Extracts the type information for a list of cube record measures
 */
type ExtractCubeRecordMeasureTypes<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[],
> = M extends []
  ? Record<string, never>
  : {
      [K in M[number]]: K extends `${infer J}.${infer D}`
        ? J extends keyof CubeRecordMap
          ? D extends keyof CubeRecordMap[J]['measures']
            ? CubeRecordMap[J]['measures'][D] extends { type: infer R }
              ? R
              : unknown
            : unknown
          : unknown
        : K extends keyof CubeRecordMap[N]['measures']
          ? CubeRecordMap[N]['measures'][K] extends { type: infer R }
            ? R
            : unknown
          : unknown;
    };

/**
 * Extracts the type information for a list of cube record dimensions
 */
type ExtractCubeRecordDimensionTypes<
  N extends CubeRecordName,
  D extends CubeRecordQueryDimension<N>[],
> = D extends []
  ? Record<string, never>
  : {
      [K in D[number]]: K extends `${infer J}.${infer Dim}`
        ? J extends keyof CubeRecordMap
          ? Dim extends keyof CubeRecordMap[J]['dimensions']
            ? CubeRecordMap[J]['dimensions'][Dim] extends { type: infer R }
              ? R
              : unknown
            : unknown
          : unknown
        : K extends keyof CubeRecordMap[N]['dimensions']
          ? CubeRecordMap[N]['dimensions'][K] extends { type: infer R }
            ? R
            : unknown
          : unknown;
    };

/**
 * Represents a row in a cube record query result, with typed measures and dimensions
 */
export type CubeRecordQueryRow<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
> = ExtractCubeRecordMeasureTypes<N, M> & ExtractCubeRecordDimensionTypes<N, D>;

/**
 * Extracts only time dimensions from a cube record
 */
export type CubeRecordTimeDimension<N extends CubeRecordName> = {
  [K in CubeRecordDimension<N>]: CubeRecordMap[N]['dimensions'][K] extends {
    __cubetype: 'time';
  }
    ? K
    : never;
}[CubeRecordDimension<N>];

/**
 * Extracts only time dimensions from joined cube records
 */
type JoinedCubeRecordTimeDimension<T extends CubeRecordName> =
  T extends CubeRecordName
    ? CubeRecordMap[T]['joins'] extends infer J
      ? J extends readonly string[]
        ? J[number] extends infer JoinName
          ? JoinName extends CubeRecordName
            ? {
                [K in keyof CubeRecordMap[JoinName]['dimensions']]: CubeRecordMap[JoinName]['dimensions'][K] extends {
                  __cubetype: 'time';
                }
                  ? `${JoinName}.${K & string}`
                  : never;
              }[keyof CubeRecordMap[JoinName]['dimensions']]
            : never
          : never
        : never
      : never
    : never;

/**
 * Type for time dimensions of a specific cube record, including joined time dimensions
 */
export type CubeRecordQueryTimeDimension<N extends CubeRecordName> =
  | CubeRecordTimeDimension<N>
  | JoinedCubeRecordTimeDimension<N>;

/**
 * Utility type to extract only string-typed fields from a type
 */
export type StringFields<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

/**
 * Utility type to pick only string-typed fields from a type
 */
export type PickStringFields<T> = Pick<T, StringFields<T>>;

/**
 * Utility type to extract only number-typed fields from a type
 */
export type NumberFields<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

/**
 * Utility type to pick only number-typed fields from a type
 */
export type PickNumberFields<T> = Pick<T, NumberFields<T>>;

/**
 * Helper type to check if all values in a union are numbers
 */
type AllNumber<T> = T extends number ? true : false;

/**
 * Helper type to check if all values in a union are strings
 */
type AllString<T> = T extends string ? true : false;

/**
 * Helper to get all measure types for a cube
 */
type GetAllMeasureTypes<N extends CubeRecordName> = {
  [K in keyof CubeRecordMap[N]['measures']]: CubeRecordMap[N]['measures'][K] extends {
    type: infer T;
  }
    ? T
    : never;
}[keyof CubeRecordMap[N]['measures']];

/**
 * Smart measure type that infers the type based on all measures
 * If all measures are numbers, returns number
 * If all measures are strings, returns string
 * Otherwise returns the union of all measure types
 */
export type CubeRecordQueryMeasureType<N extends CubeRecordName> =
  GetAllMeasureTypes<N> extends infer Types
    ? [Types] extends [never]
      ? unknown
      : AllNumber<Types> extends true
        ? number
        : AllString<Types> extends true
          ? string
          : Types
    : unknown;

/**
 * Helper to extract measure types when all are the same type
 */
type SmartMeasureTypes<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[],
> = M extends []
  ? Record<string, never>
  : CubeRecordQueryMeasureType<N> extends number
    ? { [K in M[number]]: number }
    : CubeRecordQueryMeasureType<N> extends string
      ? { [K in M[number]]: string }
      : ExtractCubeRecordMeasureTypes<N, M>;

/**
 * Enhanced query row type with better inference for measures
 * When all measures in a cube are numbers, measure fields will be typed as number
 * When all measures are strings, they'll be typed as string
 * Otherwise falls back to specific types per measure
 */
export type CubeRecordQueryRowEnhanced<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
> = SmartMeasureTypes<N, M> & ExtractCubeRecordDimensionTypes<N, D>;

/**
 * Type-safe groupBy helper - extracts keys that are strings
 */
export type GroupByKey<T> = StringFields<T>;
