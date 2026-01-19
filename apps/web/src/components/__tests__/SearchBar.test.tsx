/**
 * SearchBar Component Tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByRole('searchbox') || screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<SearchBar onSearch={() => {}} placeholder="Search jobs..." />);
    expect(screen.getByPlaceholderText('Search jobs...')).toBeInTheDocument();
  });

  it('calls onSearch when form submitted', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox') || screen.getByRole('textbox');
    await userEvent.type(input, 'developer');
    
    fireEvent.submit(input.closest('form') || input);
    
    expect(handleSearch).toHaveBeenCalledWith('developer');
  });

  it('calls onSearch when Enter is pressed', async () => {
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox') || screen.getByRole('textbox');
    await userEvent.type(input, 'designer{enter}');
    
    expect(handleSearch).toHaveBeenCalledWith('designer');
  });

  it('clears input when clear button clicked', async () => {
    render(<SearchBar onSearch={() => {}} />);

    const input = screen.getByRole('searchbox') || screen.getByRole('textbox');
    await userEvent.type(input, 'test query');
    
    expect(input).toHaveValue('test query');

    const clearButton = screen.queryByRole('button', { name: /clear/i }) ||
                        screen.queryByLabelText(/clear/i);
    
    if (clearButton) {
      await userEvent.click(clearButton);
      expect(input).toHaveValue('');
    }
  });

  it('shows search icon', () => {
    const { container } = render(<SearchBar onSearch={() => {}} />);
    
    // Check for search icon (SVG or icon element)
    const icon = container.querySelector('svg') || 
                 container.querySelector('[data-testid="search-icon"]');
    expect(icon).toBeInTheDocument();
  });

  it('handles controlled value', () => {
    const { rerender } = render(
      <SearchBar onSearch={() => {}} value="initial" onChange={() => {}} />
    );

    const input = screen.getByRole('searchbox') || screen.getByRole('textbox');
    expect(input).toHaveValue('initial');

    rerender(
      <SearchBar onSearch={() => {}} value="updated" onChange={() => {}} />
    );
    expect(input).toHaveValue('updated');
  });

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn();
    render(<SearchBar onSearch={() => {}} onChange={handleChange} />);

    const input = screen.getByRole('searchbox') || screen.getByRole('textbox');
    await userEvent.type(input, 'a');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(<SearchBar onSearch={() => {}} disabled />);

    const input = screen.getByRole('searchbox') || screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<SearchBar onSearch={() => {}} loading />);
    
    // Should show loading spinner
    const spinner = screen.queryByRole('status') ||
                    document.querySelector('[class*="animate-spin"]') ||
                    screen.queryByTestId('loading-spinner');
    
    expect(spinner).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SearchBar onSearch={() => {}} className="custom-search" />
    );
    
    expect(container.firstChild).toHaveClass('custom-search');
  });
});
