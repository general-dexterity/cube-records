import type {
  BinaryOperator,
  Query as CoreCubeQuery,
  ResultSet,
  TimeDimension,
  UnaryOperator,
} from "@cubejs-client/core";
import {
  type UseCubeQueryOptions as UseCoreCubeQueryOptions,
  useCubeQuery as useCoreCubeQuery,
} from "@cubejs-client/react";
import type {
  CubeRecordAttribute,
  CubeRecordName,
  CubeRecordQueryDimension,
  CubeRecordQueryMeasure,
  CubeRecordQueryRow,
  CubeRecordQueryTimeDimension,
} from "./types";

/**
 * Remap keys by adding the model prefix to non-joined attributes
 */
// TODO: Delete this when we handle non stripping in the `CubeRecordQueryRow` type.
type RemapKeysWithModel<N extends CubeRecordName, T> = {
  [K in keyof T as K extends string
    ? K extends `${string}.${string}`
      ? K
      : `${N}.${K}`
    : K]: T[K];
};

/**
 * Filter definition for cube record queries
 */
export type CubeRecordQueryFilter<N extends CubeRecordName> =
  | {
      member: CubeRecordQueryMeasure<N> | CubeRecordQueryDimension<N>;
      operator: BinaryOperator;
      values: string[];
    }
  | {
      member: CubeRecordQueryMeasure<N> | CubeRecordQueryDimension<N>;
      operator: UnaryOperator;
      values?: never;
    };

/**
 * Order type that accepts any valid attribute (measure or dimension) from the cube
 */
export type CubeRecordOrder<N extends CubeRecordName> = Partial<
  Record<CubeRecordAttribute<N>, "asc" | "desc">
>;

/**
 * Type-safe time dimension that only accepts dimensions with time type
 */
export type CubeRecordTimeDimensionParam<N extends CubeRecordName> = Omit<
  TimeDimension,
  "dimension"
> & {
  dimension: CubeRecordQueryTimeDimension<N>;
};

/**
 * Query parameters for the useCubeRecordQuery hook
 */
export interface CubeRecordQueryParams<N extends CubeRecordName> {
  dimensions?: CubeRecordQueryDimension<N>[];
  filters?: CubeRecordQueryFilter<N>[];
  limit?: number;
  measures?: CubeRecordQueryMeasure<N>[];
  offset?: number;
  order?: CubeRecordOrder<N>;
  segments?: string[];
  timeDimensions?: CubeRecordTimeDimensionParam<N>[];
  timezone?: string;
  total?: boolean;
  ungrouped?: boolean;
}

/**
 * Result of the useCubeRecordQuery hook
 */
export interface CubeRecordQueryResult<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
  Strip extends boolean = true,
> {
  // TODO: Use a single type that handles both stripped and non-stripped cases.
  data: (Strip extends true
    ? CubeRecordQueryRow<N, M, D>
    : RemapKeysWithModel<N, CubeRecordQueryRow<N, M, D>>)[];
  error?: Error;
  isLoading: boolean;
  refetch: () => Promise<void>;
  resultSet?: ResultSet;
  totalResultCount: number | null;
}

/**
 * Formats filters for Cube.js query
 */
const formatFilters = <N extends CubeRecordName>(
  filters: CubeRecordQueryFilter<N>[],
  cubeRecordName: string,
) =>
  filters.map((filter) => {
    const member = filter.member.includes(".")
      ? filter.member
      : `${cubeRecordName}.${filter.member}`;

    if ("values" in filter && filter.values) {
      return {
        member,
        operator: filter.operator,
        values: filter.values,
      };
    }

    return {
      member,
      operator: filter.operator,
    };
  });

/**
 * Formats result set data by removing cube name prefixes from keys
 */
const formatResultSet = <_N extends CubeRecordName>(
  resultSet: ResultSet | null | undefined,
  cubeRecordName: string,
  strip: boolean,
): Record<string, unknown>[] => {
  if (!resultSet) {
    return [];
  }

  const data = resultSet.tablePivot();

  if (!strip) {
    // Keep as-is
    return data as unknown as Record<string, unknown>[];
  }

  return data.map((row) => {
    const formattedRow: Record<string, unknown> = {};

    for (const key in row) {
      if (Object.hasOwn(row, key)) {
        // Remove cube name prefix (e.g., "users.id" -> "id")
        const cleanKey = key.startsWith(`${cubeRecordName}.`)
          ? key.slice(cubeRecordName.length + 1)
          : key;
        formattedRow[cleanKey] = row[key];
      }
    }

    return formattedRow;
  });
};

export interface UseCubeRecordFormattingOptions {
  stripModelPrefix?: boolean;
}

export type UseCubeRecordOptions = UseCoreCubeQueryOptions &
  UseCubeRecordFormattingOptions;

export interface UseCubeRecordQueryProps<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
> {
  model: N;
  options?: UseCubeRecordOptions;
  query: CubeRecordQueryParams<N> & {
    measures?: M;
    dimensions?: D;
  };
}

/**
 * A strongly-typed wrapper around Cube.js useCubeQuery hook for CubeRecords
 *
 * @param cubeRecordName - The name of the cube record
 * @param query - Query parameters including measures, dimensions, filters, etc.
 * @returns Strongly typed query result with data, loading state, and error handling
 */
// Overloads for better type narrowing based on options.stripModelPrefix
export function useCubeRecordQuery<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
>(
  props: UseCubeRecordQueryProps<N, M, D> & {
    options?: UseCubeRecordOptions & { stripModelPrefix?: true | undefined };
  },
): CubeRecordQueryResult<N, M, D, true>;

export function useCubeRecordQuery<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
>(
  props: UseCubeRecordQueryProps<N, M, D> & {
    options: UseCubeRecordOptions & { stripModelPrefix: false };
  },
): CubeRecordQueryResult<N, M, D, false>;

export function useCubeRecordQuery<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
>({
  model: cubeRecordName,
  query,
  options,
}: UseCubeRecordQueryProps<N, M, D> & {
  options?: UseCubeRecordOptions;
}): CubeRecordQueryResult<N, M, D, boolean> {
  // Build the Cube.js query
  const cubeQuery: CoreCubeQuery = {
    dimensions: query.dimensions?.map((dimension) =>
      dimension.includes(".") ? dimension : `${cubeRecordName}.${dimension}`,
    ),
    filters: query.filters
      ? formatFilters(query.filters, cubeRecordName)
      : undefined,
    limit: query.limit,
    measures: query.measures?.map((measure) =>
      measure.includes(".") ? measure : `${cubeRecordName}.${measure}`,
    ),
    offset: query.offset,
    order: query.order
      ? Object.entries(query.order).reduce<Record<string, "asc" | "desc">>(
          (acc, [key, direction]) => {
            const member = key.includes(".") ? key : `${cubeRecordName}.${key}`;
            acc[member] = direction as "asc" | "desc";
            return acc;
          },
          {},
        )
      : undefined,
    segments: query.segments,
    timeDimensions: query.timeDimensions?.map((td) => ({
      ...td,
      dimension: td.dimension.includes(".")
        ? td.dimension
        : `${cubeRecordName}.${td.dimension}`,
    })),
    timezone: query.timezone,
    total: query.total,
    ungrouped: query.ungrouped,
  };

  const hasStripFlag =
    options != null && Object.hasOwn(options as object, "stripModelPrefix");
  const { stripModelPrefix = true, ...coreOptions } = options ?? {};
  const forwardedOptions = hasStripFlag ? coreOptions : options;

  // Use the core Cube.js query hook
  const { resultSet, isLoading, error, refetch } = useCoreCubeQuery(
    cubeQuery,
    forwardedOptions,
  );

  // Format the result data
  const formattedData = formatResultSet(
    resultSet,
    cubeRecordName,
    stripModelPrefix,
  );
  const totalResultCount = resultSet?.totalRows() ?? null;

  // Cast to strongly typed result based on strip flag (overloads drive the API type)
  const data = formattedData as unknown as
    | CubeRecordQueryRow<N, M, D>[]
    | RemapKeysWithModel<N, CubeRecordQueryRow<N, M, D>>[];

  return {
    data,
    error: error as Error | undefined,
    isLoading,
    refetch,
    resultSet: resultSet as ResultSet | undefined,
    totalResultCount,
  };
}
