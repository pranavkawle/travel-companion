/**
 * Mock Auth0 Hook
 * 
 * Provides a mock implementation of the Auth0 useAuth hook for testing.
 */

export const createMockAuth0User = (overrides = {}) => ({
  sub: 'auth0|test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});

export const createMockAuth0Context = (overrides = {}) => ({
  user: createMockAuth0User(),
  isAuthenticated: true,
  isLoading: false,
  loginWithRedirect: jest.fn(),
  logout: jest.fn(),
  getAccessTokenSilently: jest.fn().mockResolvedValue('mock-access-token'),
  getIdTokenClaims: jest.fn().mockResolvedValue({
    sub: 'auth0|test-user-id',
    email: 'test@example.com',
  }),
  ...overrides,
});

/**
 * Mock useAuth0 hook
 * Usage in tests:
 * 
 * jest.mock('@auth0/auth0-react', () => ({
 *   useAuth0: () => createMockAuth0Context(),
 * }));
 */
export const mockUseAuth0 = (context = {}) => {
  return jest.fn(() => createMockAuth0Context(context));
};
