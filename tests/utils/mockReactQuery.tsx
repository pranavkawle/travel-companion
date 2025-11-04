/**
 * Mock React Query
 * 
 * Provides utilities for testing components that use React Query hooks.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

/**
 * Create a test QueryClient with minimal config for tests
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: Infinity, // Keep data in cache during tests
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * Create mock query results
 */
export const createMockQueryResult = <T,>(data: T, overrides = {}) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: true,
  status: 'success' as const,
  refetch: jest.fn(),
  ...overrides,
});

/**
 * Create mock mutation results
 */
export const createMockMutationResult = (overrides = {}) => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  error: null,
  isSuccess: false,
  status: 'idle' as const,
  reset: jest.fn(),
  ...overrides,
});

/**
 * Wrapper component for testing with QueryClient
 * 
 * Usage:
 * const wrapper = createQueryWrapper();
 * render(<MyComponent />, { wrapper });
 */
export const createQueryWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};
