/**
 * Example Accessibility Tests
 * 
 * Demonstrates how to test components for WCAG 2.1 AA compliance.
 */

import { render } from '@testing-library/react';
import { axe, expectAccessible } from './a11yUtils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should be accessible', async () => {
      const { container } = render(<Button>Click me</Button>);
      await expectAccessible(container);
    });

    it('should have sufficient color contrast', async () => {
      const { container } = render(<Button variant="primary">Primary Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible', async () => {
      const { container } = render(<Button>Keyboard Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component', () => {
    it('should be accessible', async () => {
      const { container } = render(<Input label="Email" id="email" />);
      await expectAccessible(container);
    });

    it('should have accessible labels', async () => {
      const { container } = render(<Input label="Username" id="username" required />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible error messages', async () => {
      const { container } = render(
        <Input label="Email" id="email" error="Invalid email address" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
