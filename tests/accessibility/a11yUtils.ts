/**
 * Accessibility Testing Setup
 * 
 * Provides utilities for testing WCAG 2.1 AA compliance using axe-core.
 */

import { configureAxe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Configure axe with custom rules for our application
 */
export const axe = configureAxe({
  rules: {
    // Ensure color contrast meets WCAG AA standards
    'color-contrast': { enabled: true },
    // Ensure all form elements have labels
    'label': { enabled: true },
    // Ensure all images have alt text
    'image-alt': { enabled: true },
    // Ensure headings are in correct order
    'heading-order': { enabled: true },
    // Ensure links have discernible text
    'link-name': { enabled: true },
    // Ensure buttons have discernible text
    'button-name': { enabled: true },
  },
});

/**
 * Helper function to test accessibility of a rendered component
 * 
 * Usage:
 * const { container } = render(<MyComponent />);
 * await expectAccessible(container);
 */
export const expectAccessible = async (container: Element) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

/**
 * Helper function to test specific accessibility rules
 * 
 * Usage:
 * await expectAccessibleWithRules(container, ['color-contrast', 'label']);
 */
export const expectAccessibleWithRules = async (
  container: Element,
  rules: string[]
) => {
  const customAxe = configureAxe({
    rules: rules.reduce((acc, rule) => ({ ...acc, [rule]: { enabled: true } }), {}),
  });
  
  const results = await customAxe(container);
  expect(results).toHaveNoViolations();
};
