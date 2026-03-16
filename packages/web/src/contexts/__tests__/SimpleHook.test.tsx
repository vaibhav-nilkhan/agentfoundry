import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

const SimpleComponent = () => {
  const [val] = useState("Hello");
  return <div>{val}</div>;
};

describe('Simple Hook', () => {
  it('works', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
