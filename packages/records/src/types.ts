/**
 * Base interface for defining a CubeRecord.
 */
export interface CubeRecordDefinition {
  name: string;
  measures: Record<string, { type: unknown }>;
  dimensions: Record<string, { type: unknown }>;
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
