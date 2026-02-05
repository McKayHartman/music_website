// navbar component
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
	<nav className="fixed top-0 left-0 w-full p-4 z-50 bg-gray-500 p-4 flex space-x-4 ">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
  </nav>
  );
};

export default Navbar;