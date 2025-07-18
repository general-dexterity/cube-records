/// <reference path="./global-types.d.ts" />
import type { ResultSet } from '@cubejs-client/core';
import { renderHook } from '@testing-library/react';
import { assert, beforeEach, describe, it, type Mock, vi } from 'vitest';
import { useCubeRecordQuery } from '../src/use-cube-record-query';
import { createMock } from './utils/mock';

// Mock the @cubejs-client/react module
vi.mock('@cubejs-client/react', () => ({
  useCubeQuery: vi.fn(),
}));

// Import the mocked function
import { useCubeQuery as mockUseCubeQuery } from '@cubejs-client/react';

describe('useCubeRecordQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query transformation', () => {
    it('transforms measures and dimensions with cube prefix', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {
            measures: ['count', 'totalRevenue'],
            dimensions: ['id', 'name'],
          },
        })
      );

      // Verify the underlying hook was called with prefixed values
      const callArgs = (mockUseCubeQuery as Mock).mock.calls[0][0];
      assert.deepEqual(callArgs.measures, [
        'users.count',
        'users.totalRevenue',
      ]);
      assert.deepEqual(callArgs.dimensions, ['users.id', 'users.name']);
    });

    it('preserves joined cube references', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'orders',
          query: {
            measures: ['count', 'users.count'],
            dimensions: ['status', 'users.name'],
          },
        })
      );

      const callArgs = (mockUseCubeQuery as Mock).mock.calls[0][0];
      assert.deepEqual(callArgs.measures, ['orders.count', 'users.count']);
      assert.deepEqual(callArgs.dimensions, ['orders.status', 'users.name']);
    });

    it('transforms filters correctly', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {
            filters: [
              {
                member: 'name',
                operator: 'equals',
                values: ['John'],
              },
              {
                member: 'email',
                operator: 'set',
              },
            ],
          },
        })
      );

      const callArgs = (mockUseCubeQuery as Mock).mock.calls[0][0];
      assert(callArgs.filters[0].member === 'users.name');
      assert(callArgs.filters[0].operator === 'equals');
      assert.deepEqual(callArgs.filters[0].values, ['John']);
      assert(callArgs.filters[1].member === 'users.email');
      assert(callArgs.filters[1].operator === 'set');
    });

    it('transforms time dimensions correctly', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'orders',
          query: {
            timeDimensions: [
              {
                dimension: 'createdAt',
                granularity: 'day',
                dateRange: 'last 7 days',
              },
            ],
          },
        })
      );

      const callArgs = (mockUseCubeQuery as Mock).mock.calls[0][0];
      assert(callArgs.timeDimensions[0].dimension === 'orders.createdAt');
      assert(callArgs.timeDimensions[0].granularity === 'day');
      assert(callArgs.timeDimensions[0].dateRange === 'last 7 days');
    });

    it('transforms order keys correctly', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'orders',
          query: {
            order: {
              count: 'asc',
              'users.name': 'desc',
            },
          },
        })
      );

      const callArgs = (mockUseCubeQuery as Mock).mock.calls[0][0];
      assert(callArgs.order['orders.count'] === 'asc');
      assert(callArgs.order['users.name'] === 'desc');
    });
  });

  describe('Result transformation', () => {
    it('removes cube prefix from result data', () => {
      const mockData = [
        {
          'users.id': '1',
          'users.name': 'John Doe',
          'users.count': 10,
        },
        {
          'users.id': '2',
          'users.name': 'Jane Smith',
          'users.count': 20,
        },
      ];

      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue(mockData),
        totalRows: vi.fn().mockReturnValue(2),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {
            measures: ['count'],
            dimensions: ['id', 'name'],
          },
        })
      );

      assert(result.current.data.length === 2);
      assert(result.current.data[0].id === '1');
      assert(result.current.data[0].name === 'John Doe');
      assert(result.current.data[0].count === 10);
      assert(!('users.id' in result.current.data[0]));
      assert(!('users.name' in result.current.data[0]));
      assert(!('users.count' in result.current.data[0]));
    });

    it('preserves joined cube prefixes in results', () => {
      const mockData = [
        {
          'orders.id': 'order-1',
          'orders.status': 'completed',
          'orders.totalAmount': 100,
          'users.name': 'John Doe',
        },
      ];

      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue(mockData),
        totalRows: vi.fn().mockReturnValue(1),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'orders',
          query: {
            measures: ['totalAmount'],
            dimensions: ['id', 'status', 'users.name'],
          },
        })
      );

      // Own cube fields should have prefix removed
      assert(result.current.data[0].id === 'order-1');
      assert(result.current.data[0].status === 'completed');
      assert(result.current.data[0].totalAmount === 100);
      // Joined fields should keep their prefix
      assert(result.current.data[0]['users.name'] === 'John Doe');
    });
  });

  describe('Hook return values', () => {
    it('returns loading state', () => {
      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
        })
      );

      assert(result.current.isLoading === true);
      assert(result.current.data.length === 0);
      assert(result.current.error == null); // null or undefined
      assert(result.current.totalResultCount === null);
    });

    it('returns error state', () => {
      const testError = new Error('Query failed');

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: null,
        isLoading: false,
        error: testError,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
        })
      );

      assert(result.current.isLoading === false);
      assert(result.current.error === testError);
      assert(result.current.data.length === 0);
      assert(result.current.totalResultCount === null);
    });

    it('returns refetch function', async () => {
      const mockRefetch = vi.fn().mockResolvedValue(undefined);

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
        })
      );

      await result.current.refetch();
      assert(mockRefetch.mock.calls.length === 1);
    });

    it('returns total result count', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(42),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
        })
      );

      assert(result.current.totalResultCount === 42);
    });

    it('returns original result set', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
        })
      );

      assert(result.current.resultSet === mockResultSet);
    });
  });

  describe('Options handling', () => {
    it('passes options to underlying hook', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      const testOptions = {
        skip: true,
        resetResultSetOnChange: true,
      };

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
          options: testOptions,
        })
      );

      assert((mockUseCubeQuery as Mock).mock.calls[0][1] === testOptions);
    });
  });

  describe('Edge cases', () => {
    it('handles empty query', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {},
        })
      );

      assert(result.current.data.length === 0);
      assert(result.current.totalResultCount === 0);
    });

    it('handles null result set', () => {
      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {
            measures: ['count'],
          },
        })
      );

      assert(Array.isArray(result.current.data));
      assert(result.current.data.length === 0);
      assert(result.current.totalResultCount === null);
      assert(result.current.resultSet == null); // null or undefined
    });

    it('handles empty arrays in query', () => {
      const mockResultSet = createMock<ResultSet>({
        tablePivot: vi.fn().mockReturnValue([]),
        totalRows: vi.fn().mockReturnValue(0),
      });

      (mockUseCubeQuery as Mock).mockReturnValue({
        resultSet: mockResultSet,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      renderHook(() =>
        useCubeRecordQuery({
          model: 'users',
          query: {
            measures: [],
            dimensions: [],
            filters: [],
          },
        })
      );

      const callArgs = (mockUseCubeQuery as Mock).mock.calls[0][0];
      assert(Array.isArray(callArgs.measures));
      assert(callArgs.measures.length === 0);
      assert(Array.isArray(callArgs.dimensions));
      assert(callArgs.dimensions.length === 0);
      assert(Array.isArray(callArgs.filters));
      assert(callArgs.filters.length === 0);
    });
  });
});
