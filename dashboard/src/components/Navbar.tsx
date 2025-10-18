import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.scss';
import { Button } from './';
import { useAuth } from '../contexts/AuthContext';
import { useWebsocket } from '../contexts/WebsocketContext';

/**
 * Navbar reference for external use
 */
export const navbarRef = React.createRef<HTMLDivElement>();

/**
 * Navbar component that provides navigation and user authentication controls
 * @returns {JSX.Element} The navigation bar component
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { send } = useWebsocket();
  const navbarGapRef = React.createRef<HTMLDivElement>();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    if (navbarRef.current) {
      if (navbarGapRef.current) {
        navbarGapRef.current.style.marginTop = `${navbarRef.current.clientHeight}px`;
      }
    }
  }, [user]);

  const handleLogout = () => {
    send({ type: 'logout' });
    logout();
    navigate('/login');
    setMenuOpen(false);
  }

  return (
    <div ref={navbarGapRef}>
      <nav className="navbar" ref={navbarRef}>
        <div className="navbar-brand">
          <Link to="/dashboard">SniffR</Link>
        </div>
        <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
          <span />
          <span />
          <span />
        </button>
        <div className={`navbar-menu${menuOpen ? ' open' : ''}`}>
          {user ? (
            <>
              <Link to="/devices" className="nav-link" onClick={() => setMenuOpen(false)}>Appareils</Link>
              <span className="user-info">Bienvenue, {user?.Username}</span>
              <Button className="logout-button" onClick={handleLogout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Connexion</Link>
              <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Inscription</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;