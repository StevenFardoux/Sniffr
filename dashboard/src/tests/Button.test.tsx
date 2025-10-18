import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

/**
 * Tests unitaires du composant <Button />
 */

describe('<Button />', () => {
  it('rend correctement le texte passé en enfant', () => {
    render(<Button>Cliquer</Button>);

    expect(screen.getByText(/cliquer/i)).toBeInTheDocument();
  });

  it('déclenche la fonction onClick lors d’un clic', () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Appuyez</Button>);

    fireEvent.click(screen.getByText(/appuyez/i));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 