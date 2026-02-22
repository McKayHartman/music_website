import '../styles/NavbarStyles.css';

import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { clearAuthToken, isAdmin, isAuthenticated } from '../utils/auth.js';

export default function Navbar() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [admin, setAdmin] = useState(isAdmin());

  useEffect(() => {
    function syncAuthState() {
      setAuthenticated(isAuthenticated());
      setAdmin(isAdmin());
    }

    window.addEventListener('auth-changed', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('auth-changed', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  function handleLogout() {
    clearAuthToken();
    setAuthenticated(false);
    setAdmin(false);
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <NavLink to="/" className="navbar__logo">
          Annie Hartman Music
        </NavLink>
      </div>

      <ul className="navbar__links">
        <li>
          <NavLink to="/" end className="navbar__link">
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/music" className="navbar__link">
            Music
          </NavLink>
        </li>

        <li>
          <NavLink to="/about" className="navbar__link">
            About
          </NavLink>
        </li>

        {admin && (
          <li>
            <NavLink to="/admin" className="navbar__link navbar__admin">
              Admin
            </NavLink>
          </li>
        )}
      </ul>

      <div className="navbar__actions">
        {authenticated ? (
          <>
            <NavLink to="/my-account" className="navbar__account">
              <span>My Account</span>
            </NavLink>
            <button type="button" className="navbar__logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar__account">
              <span>Login</span>
            </NavLink>

            <NavLink to="/create-account" className="navbar__account navbar__account--primary">
              <span>Create Account</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
