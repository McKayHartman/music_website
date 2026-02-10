import "../styles/NavbarStyles.css";

import { NavLink } from "react-router-dom";


export default function Navbar() {
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

        <li>
          <NavLink to="/admin" className="navbar__link navbar__admin">
            Admin
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
