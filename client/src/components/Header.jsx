import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiHome } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-400">
            Shopix
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
            >
              <FiHome size={20} />
              <span>Home</span>
            </Link>

            <Link
              to="/cart"
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
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
                >
                  <FiUser size={20} />
                  <span>{user?.name}</span>
                </Link>

                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-red-400 transition-colors"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 hover:text-indigo-400 transition-colors"
              >
                <FiUser size={20} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
