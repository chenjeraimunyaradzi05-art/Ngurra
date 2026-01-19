/**
 * Skeleton Component Tests
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders with custom width', () => {
    const { container } = render(<Skeleton width={200} />);
    expect(container.firstChild).toHaveStyle({ width: '200px' });
  });

  it('renders with custom height', () => {
    const { container } = render(<Skeleton height={50} />);
    expect(container.firstChild).toHaveStyle({ height: '50px' });
  });

  it('renders with string dimensions', () => {
    const { container } = render(<Skeleton width="100%" height="2rem" />);
    expect(container.firstChild).toHaveStyle({ width: '100%', height: '2rem' });
  });

  it('renders circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('renders rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);
    expect(container.firstChild).not.toHaveClass('rounded-full');
  });

  it('renders text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass('rounded');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-skeleton" />);
    expect(container.firstChild).toHaveClass('custom-skeleton');
  });

  it('renders multiple lines', () => {
    const { container } = render(<Skeleton lines={3} />);
    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBe(3);
  });
});
