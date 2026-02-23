import '../styles/NavbarStyles.css';

import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { clearAuthToken, isAdmin, isAuthenticated } from '../utils/auth.js';

export default function Navbar() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [admin, setAdmin] = useState(isAdmin());
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.navbar__dropdown')) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  function handleLogout() {
    clearAuthToken();
    setAuthenticated(false);
    setAdmin(false);
    setDropdownOpen(false);
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

        {authenticated && (
          <li>
            
          </li>
        )}

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
            <NavLink to="/cart" className="navbar__link">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
              Cart
            </NavLink>

            <div className="navbar__dropdown relative">
              <button
                type="button"
                className="navbar__account flex items-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>My Account</span>
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="navbar__dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <NavLink
                    to="/my-purchases"
                    className="navbar__dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Purchases
                  </NavLink>
                  <NavLink
                    to="/my-account"
                    className="navbar__dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Manage Account
                  </NavLink>
                  <button
                    type="button"
                    className="navbar__dropdown-item w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
