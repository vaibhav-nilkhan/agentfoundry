import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MetricDisplay } from '../MetricDisplay';

// Mock framer-motion to prevent hook/context errors in jsdom environment
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: any) => <div className={className}>{children}</div>,
  },
}));

describe('MetricDisplay', () => {
  it('renders the label and value correctly', () => {
    render(<MetricDisplay label="Total Cost" value="150" />);
    
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders the currency symbol when isCurrency is true', () => {
    render(<MetricDisplay label="Total Cost" value="150" isCurrency={true} />);
    
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders the subValue when provided', () => {
    render(<MetricDisplay label="Test" value="10" subValue="/ 10 total" />);
    
    expect(screen.getByText('/ 10 total')).toBeInTheDocument();
  });

  it('renders the correct trend indicator', () => {
    const { rerender } = render(<MetricDisplay label="Cost" value="10" trend="up" />);
    expect(screen.getByText('↑ Increasing')).toBeInTheDocument();

    rerender(<MetricDisplay label="Cost" value="10" trend="down" />);
    expect(screen.getByText('↓ Decreasing (Good)')).toBeInTheDocument();
  });

  it('applies the correct status dot class', () => {
    // Testing the UI status indicators that define our "God Tier" look
    const { container: successContainer } = render(<MetricDisplay label="Pass" value="100%" status="success" />);
    // The status dot is rendered as a span before the label text
    const successDot = successContainer.querySelector('.status-dot');
    expect(successDot).toHaveClass('success');
    expect(successDot).not.toHaveClass('error');

    const { container: errorContainer } = render(<MetricDisplay label="Pass" value="100%" status="error" />);
    const errorDot = errorContainer.querySelector('.status-dot');
    expect(errorDot).toHaveClass('error');
  });
});
