/**
 * Toast Component Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Toast from '../Toast';
import ToastContainer from '../ToastContainer';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message correctly', () => {
    render(<Toast message="Test message" type="info" onClose={() => {}} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success toast', () => {
    const { container } = render(
      <Toast message="Success!" type="success" onClose={() => {}} />
    );
    expect(container.firstChild).toHaveClass('bg-green');
  });

  it('renders error toast', () => {
    const { container } = render(
      <Toast message="Error!" type="error" onClose={() => {}} />
    );
    expect(container.firstChild).toHaveClass('bg-red');
  });

  it('renders warning toast', () => {
    const { container } = render(
      <Toast message="Warning!" type="warning" onClose={() => {}} />
    );
    expect(container.firstChild).toHaveClass('bg-yellow');
  });

  it('renders info toast', () => {
    const { container } = render(
      <Toast message="Info" type="info" onClose={() => {}} />
    );
    expect(container.firstChild).toHaveClass('bg-blue');
  });

  it('auto-dismisses after duration', () => {
    const handleClose = vi.fn();
    render(
      <Toast message="Auto dismiss" type="info" duration={3000} onClose={handleClose} />
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleClose).toHaveBeenCalled();
  });

  it('does not auto-dismiss when duration is 0', () => {
    const handleClose = vi.fn();
    render(
      <Toast message="Persistent" type="info" duration={0} onClose={handleClose} />
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders with title', () => {
    render(
      <Toast message="Message" title="Title" type="info" onClose={() => {}} />
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const handleAction = vi.fn();
    render(
      <Toast 
        message="Message" 
        type="info" 
        onClose={() => {}} 
        action={{ label: 'Undo', onClick: handleAction }}
      />
    );
    
    const actionButton = screen.getByText('Undo');
    expect(actionButton).toBeInTheDocument();
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    render(
      <ToastContainer>
        <Toast message="Toast 1" type="info" onClose={() => {}} />
        <Toast message="Toast 2" type="success" onClose={() => {}} />
      </ToastContainer>
    );

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('positions toasts correctly', () => {
    const { container } = render(
      <ToastContainer position="top-right">
        <Toast message="Toast" type="info" onClose={() => {}} />
      </ToastContainer>
    );

    expect(container.firstChild).toHaveClass('top-0');
    expect(container.firstChild).toHaveClass('right-0');
  });
});
