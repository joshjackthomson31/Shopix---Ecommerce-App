import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiHome, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-400">
            Shopix
          </Link>

          {/* Hamburger button — visible on mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:text-indigo-400 transition-colors"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop nav — hidden on mobile */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks
              isAuthenticated={isAuthenticated}
              user={user}
              itemsCount={itemsCount}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Mobile menu — slides down when open */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-700 flex flex-col space-y-4">
            <NavLinks
              isAuthenticated={isAuthenticated}
              user={user}
              itemsCount={itemsCount}
              onLogout={handleLogout}
              onLinkClick={closeMenu}
            />
          </div>
        )}
      </nav>
    </header>
  );
};

/** Shared nav links — rendered in both desktop and mobile layouts */
const NavLinks = ({ isAuthenticated, user, itemsCount, onLogout, onLinkClick }) => {
  return (
    <>
      <Link
        to="/"
        onClick={onLinkClick}
        className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
      >
        <FiHome size={20} />
        <span>Home</span>
      </Link>

      <Link
        to="/cart"
        onClick={onLinkClick}
        className="flex items-center space-x-1 hover:text-indigo-400 transition-colors relative"
      >
        <FiShoppingCart size={20} />
        <span>Cart</span>
        {itemsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemsCount}
          </span>
        )}
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            to="/profile"
            onClick={onLinkClick}
            className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
          >
            <FiUser size={20} />
            <span>{user?.name}</span>
          </Link>

          {user?.isAdmin && (
            <Link
              to="/admin"
              onClick={onLinkClick}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Admin
            </Link>
          )}

          <button
            onClick={onLogout}
            className="flex items-center space-x-1 hover:text-red-400 transition-colors"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <Link
          to="/login"
          onClick={onLinkClick}
          className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
        >
          <FiUser size={20} />
          <span>Sign In</span>
        </Link>
      )}
    </>
  );
};

export default Header;
