import type {
  BinaryOperator,
  Query as CoreCubeQuery,
  ResultSet,
  TimeDimension,
  UnaryOperator,
} from '@cubejs-client/core';
import {
  type UseCubeQueryOptions as UseCoreCubeQueryOptions,
  useCubeQuery as useCoreCubeQuery,
} from '@cubejs-client/react';
import type {
  CubeRecordName,
  CubeRecordQueryDimension,
  CubeRecordQueryMeasure,
  CubeRecordQueryRow,
} from './types';

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
 * Query parameters for the useCubeRecordQuery hook
 */
export interface CubeRecordQueryParams<N extends CubeRecordName> {
  measures?: CubeRecordQueryMeasure<N>[];
  dimensions?: CubeRecordQueryDimension<N>[];
  filters?: CubeRecordQueryFilter<N>[];
  segments?: string[];
  timeDimensions?: Array<
    TimeDimension & {
      dimension: CubeRecordQueryDimension<N>;
    }
  >;
  limit?: number;
  offset?: number;
  order?: Record<string, 'asc' | 'desc'>;
  timezone?: string;
  renewQuery?: boolean;
  ungrouped?: boolean;
  total?: boolean;
}

/**
 * Result of the useCubeRecordQuery hook
 */
export interface CubeRecordQueryResult<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
> {
  isLoading: boolean;
  error?: Error;
  resultSet?: ResultSet;
  refetch: () => Promise<void>;
  data: CubeRecordQueryRow<N, M, D>[];
  totalResultCount: number | null;
}

/**
 * Formats filters for Cube.js query
 */
const formatFilters = <N extends CubeRecordName>(
  filters: CubeRecordQueryFilter<N>[],
  cubeRecordName: string
) => {
  return filters.map((filter) => {
    const member = filter.member.includes('.')
      ? filter.member
      : `${cubeRecordName}.${filter.member}`;

    if ('values' in filter && filter.values) {
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
};

/**
 * Formats result set data by removing cube name prefixes from keys
 */
const formatResultSet = <_N extends CubeRecordName>(
  resultSet: ResultSet | null | undefined,
  cubeRecordName: string
): Record<string, unknown>[] => {
  if (!resultSet) {
    return [];
  }

  const data = resultSet.tablePivot();

  return data.map((row) => {
    const formattedRow: Record<string, unknown> = {};

    for (const key in row) {
      if (Object.hasOwn(row, key)) {
        // Remove cube name prefix (e.g., "users.id" -> "id")
        const cleanKey = key.startsWith(`${cubeRecordName}.`)
          ? key.substring(cubeRecordName.length + 1)
          : key;
        formattedRow[cleanKey] = row[key];
      }
    }

    return formattedRow;
  });
};

type UseCubeRecordQueryProps<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
> = {
  model: N;
  query: CubeRecordQueryParams<N> & {
    measures?: M;
    dimensions?: D;
  };
  options?: UseCoreCubeQueryOptions;
};

/**
 * A strongly-typed wrapper around Cube.js useCubeQuery hook for CubeRecords
 *
 * @param cubeRecordName - The name of the cube record
 * @param query - Query parameters including measures, dimensions, filters, etc.
 * @returns Strongly typed query result with data, loading state, and error handling
 */
export function useCubeRecordQuery<
  N extends CubeRecordName,
  M extends CubeRecordQueryMeasure<N>[] = [],
  D extends CubeRecordQueryDimension<N>[] = [],
>({
  model: cubeRecordName,
  query,
  options,
}: UseCubeRecordQueryProps<N, M, D>): CubeRecordQueryResult<N, M, D> {
  // Build the Cube.js query
  const cubeQuery: CoreCubeQuery = {
    measures: query.measures?.map((measure) =>
      measure.includes('.') ? measure : `${cubeRecordName}.${measure}`
    ),
    dimensions: query.dimensions?.map((dimension) =>
      dimension.includes('.') ? dimension : `${cubeRecordName}.${dimension}`
    ),
    filters: query.filters
      ? formatFilters(query.filters, cubeRecordName)
      : undefined,
    segments: query.segments,
    timeDimensions: query.timeDimensions?.map((td) => ({
      ...td,
      dimension: td.dimension.includes('.')
        ? td.dimension
        : `${cubeRecordName}.${td.dimension}`,
    })),
    limit: query.limit,
    offset: query.offset,
    order: query.order
      ? Object.entries(query.order).reduce(
          (acc, [key, direction]) => {
            const member = key.includes('.') ? key : `${cubeRecordName}.${key}`;
            acc[member] = direction;
            return acc;
          },
          {} as Record<string, 'asc' | 'desc'>
        )
      : undefined,
    timezone: query.timezone,
    renewQuery: query.renewQuery,
    ungrouped: query.ungrouped,
    total: query.total,
  };

  // Use the core Cube.js query hook
  const { resultSet, isLoading, error, refetch } = useCoreCubeQuery(
    cubeQuery,
    options
  );

  // Format the result data
  const formattedData = formatResultSet(resultSet, cubeRecordName);
  const totalResultCount = resultSet?.totalRows() ?? null;

  // Cast to strongly typed result
  const data = formattedData as unknown as CubeRecordQueryRow<N, M, D>[];

  return {
    isLoading,
    error: error as Error | undefined,
    resultSet: resultSet as ResultSet | undefined,
    refetch,
    data,
    totalResultCount,
  };
}
