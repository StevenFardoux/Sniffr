import React from 'react';
import { render } from '@testing-library/react';
import Separator from '../components/Separator';

/**
 * Unit test for <Separator />
 */

describe('<Separator />', () => {
  it('rend un div avec la classe CSS adéquate', () => {
    const { container } = render(<Separator />);

    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div).toHaveClass('separator');
  });
}); 