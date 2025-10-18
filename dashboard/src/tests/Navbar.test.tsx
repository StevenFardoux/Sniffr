import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useWebsocket } from '../contexts/WebsocketContext';

jest.mock('../contexts/AuthContext');
jest.mock('../contexts/WebsocketContext');

const mockUseAuth = useAuth as jest.Mock;
const mockUseWebsocket = useWebsocket as jest.Mock;

describe('<Navbar />', () => {
  const send = jest.fn();

  beforeEach(() => {
    send.mockClear();
  });

  it('affiche les liens de connexion et d’inscription lorsque l’utilisateur n’est pas authentifié', () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseWebsocket.mockReturnValue({ send });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/inscription/i)).toBeInTheDocument();
  });

  it('affiche le nom d’utilisateur et le bouton de déconnexion lorsque l’utilisateur est authentifié', () => {
    const user = { Username: 'testuser' };
    mockUseAuth.mockReturnValue({ user, logout: jest.fn() });
    mockUseWebsocket.mockReturnValue({ send });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/bienvenue, testuser/i)).toBeInTheDocument();
    expect(screen.getByText(/déconnexion/i)).toBeInTheDocument();
    expect(screen.getByText(/appareils/i)).toBeInTheDocument();
  });

  it('appelle la déconnexion et navigue lors du clic sur le bouton de déconnexion', () => {
    const user = { Username: 'testuser' };
    const logout = jest.fn();
    mockUseAuth.mockReturnValue({ user, logout });
    mockUseWebsocket.mockReturnValue({ send });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/déconnexion/i));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ type: 'logout' });
  });
}); 