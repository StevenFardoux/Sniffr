import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../routes/Login';
import { useAuth } from '../../contexts/AuthContext';
import { useWebsocket } from '../../contexts/WebsocketContext';

jest.mock('../../contexts/AuthContext');
jest.mock('../../contexts/WebsocketContext');

const mockUseAuth = useAuth as jest.Mock;
const mockUseWebsocket = useWebsocket as jest.Mock;

describe('<Login />', () => {
    const login = jest.fn();
    const send = jest.fn();

    beforeEach(() => {
        login.mockClear();
        send.mockClear();
        mockUseAuth.mockReturnValue({ login });
        mockUseWebsocket.mockReturnValue({ send });
    });

    it('affiche le titre, le sous-titre, les champs et le bouton', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: /bienvenue/i })).toBeInTheDocument();
        expect(screen.getByText(/veuillez vous connecter pour continuer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
        expect(screen.getByText(/s'inscrire/i)).toBeInTheDocument();
    });

    it('affiche une erreur si la connexion échoue', async () => {
        login.mockImplementation(() => { throw new Error('Erreur de connexion'); });
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@mail.com' } });
        fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
        expect(await screen.findByRole('alert')).toHaveTextContent(/erreur de connexion/i);
    });
}); 