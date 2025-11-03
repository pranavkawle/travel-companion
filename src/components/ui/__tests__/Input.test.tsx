import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    render(<Input label="Email" id="email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('border-danger');
  });

  it('marks input as required', () => {
    render(<Input label="Email" id="email" required />);
    const input = screen.getByLabelText(/Email/i);
    expect(input).toBeRequired();
    // Check that the asterisk is rendered
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('can type in the input field', async () => {
    const user = userEvent.setup();
    render(<Input label="Username" id="username" />);
    const input = screen.getByLabelText('Username');
    
    await user.type(input, 'testuser');
    expect(input).toHaveValue('testuser');
  });

  it('calls onChange handler when value changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input label="Email" id="email" onChange={handleChange} />);
    const input = screen.getByLabelText('Email');
    
    await user.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(<Input label="Email" id="email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });
});
