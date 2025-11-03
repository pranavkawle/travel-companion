# Testing Guide

## Overview
This project uses Jest and React Testing Library for unit and integration testing.

## Test Configuration

### Files
- `jest.config.js` - Jest configuration for Next.js
- `jest.setup.js` - Global test setup (imports jest-dom matchers)
- `tsconfig.json` - Includes Jest and jest-dom types

### Dependencies
- **jest** - Testing framework
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing
- **@testing-library/user-event** - User interaction simulation
- **jest-environment-jsdom** - Browser-like environment for tests
- **@types/jest** - TypeScript types for Jest
- **ts-jest** - TypeScript preprocessor for Jest

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Test Location
Place test files in one of these locations:
- `src/**/__tests__/**/*.test.{ts,tsx}`
- `src/**/*.test.{ts,tsx}`
- `src/**/*.spec.{ts,tsx}`

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<MyComponent onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Available Matchers

### jest-dom Custom Matchers
- `toBeInTheDocument()`
- `toBeVisible()`
- `toBeDisabled()`
- `toBeEnabled()`
- `toHaveClass()`
- `toHaveAttribute()`
- `toHaveTextContent()`
- `toHaveValue()`
- And many more...

See full list: https://github.com/testing-library/jest-dom

## Best Practices

1. **Test user behavior, not implementation details**
   - Query by accessible roles, labels, and text
   - Avoid testing internal state or implementation

2. **Use semantic queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   
   // Avoid
   screen.getByTestId('submit-button')
   ```

3. **Async interactions**
   ```typescript
   const user = userEvent.setup();
   await user.type(input, 'text');
   await user.click(button);
   ```

4. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/auth0', () => ({
     useAuth: () => ({ user: mockUser, isLoading: false }),
   }));
   ```

## Coverage Goals
- Target: 80%+ code coverage
- Priority: Critical paths and business logic
- Test files: `Button.test.tsx`, `Input.test.tsx`, etc.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Ensure path aliases in `jest.config.js` match `tsconfig.json`

2. **"toBeInTheDocument is not a function"**
   - Check that `jest.setup.js` imports `@testing-library/jest-dom`
   - Verify `setupFilesAfterEnv` in `jest.config.js`

3. **Async test timeout**
   - Increase timeout: `jest.setTimeout(10000)` in test file
   - Use `await` with async operations

## Next Steps
- Add tests for all UI components
- Test custom hooks with `@testing-library/react-hooks`
- Add integration tests for key user flows
- Set up CI/CD to run tests automatically
