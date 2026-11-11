import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/AuthContext';
import { useCart } from '../../features/cart/useCart';
import { storageUtils } from '../../utils/storageUtils';

export function Navbar() {
  const { isAuthenticated, dispatch: authDispatch } = useAuthContext();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    authDispatch({ type: 'LOGOUT' });
    storageUtils.clearToken();
    window.location.href = '/';
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-indigo-600 hover:text-indigo-700 transition" onClick={closeMenu}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <span className="tracking-tight">FoodOrder</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600" aria-label="Cart">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span
                    aria-label={`${itemCount} items in cart`}
                    className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white"
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Orders
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out of your account"
                className="text-sm font-medium text-gray-700 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="sm:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="sm:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1"
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cart
                {itemCount > 0 && (
                  <span
                    aria-label={`${itemCount} items in cart`}
                    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-bold text-white"
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                onClick={closeMenu}
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Orders
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out of your account"
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="block rounded-md px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
