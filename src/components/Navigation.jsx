import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogIn, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const cartCount = getCartCount();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-50 transition-colors duration-300 border-b dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">AB</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Rasara Bakery</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {!isAdminRoute && (
              <>
                <Link to="/">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400">
                    Browse Products
                  </Button>
                </Link>

                <Link to="/cart" className="relative">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                {!isAdminRoute && (
                  <Link to="/admin">
                    <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;