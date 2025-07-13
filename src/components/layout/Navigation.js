import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setIsLoginModalOpen, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'services', label: 'Services', path: '/services' },
    { id: 'projects', label: 'Projects', path: '/projects' },
    { id: 'tools', label: 'Tools', path: '/tools/linear-regression', requiresAuth: true },
    { id: 'blog', label: 'Blog', path: '/blog' },
    { id: 'members', label: 'Members', path: '/members', requiresAuth: true }
  ];

  const currentPath = location.pathname;

  return (
    <nav className="bg-bone/95 backdrop-blur-sm border-b border-khaki/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Logo variant="mark" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`font-medium transition-colors ${
                    currentPath === item.path 
                      ? 'text-chestnut' 
                      : 'text-charcoal hover:text-chestnut'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-charcoal">Welcome, {user.name}</span>
                <button
                  onClick={logout}
                  className="text-charcoal hover:text-chestnut transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-chestnut text-white px-4 py-2 rounded-lg hover:bg-chestnut/90 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-chestnut p-2 touch-manipulation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/25 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile menu */}
        <div className={`md:hidden fixed top-16 left-0 right-0 z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? 'transform translate-y-0' : 'transform -translate-y-full'
        }`}>
          <div className="px-4 pt-4 pb-6 space-y-2 bg-bone shadow-lg border-b border-khaki/20">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-4 py-3 text-base font-medium w-full text-left rounded-lg transition-colors touch-manipulation ${
                    currentPath === item.path 
                      ? 'text-chestnut bg-chestnut/10' 
                      : 'text-charcoal hover:text-chestnut hover:bg-chestnut/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {!user && (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-base font-medium bg-chestnut text-white rounded-lg mt-4 touch-manipulation hover:bg-chestnut/90 transition-colors"
              >
                Login
              </button>
            )}
            {user && (
              <div className="pt-2 border-t border-khaki/20 mt-2">
                <div className="px-4 py-2 text-sm text-charcoal/70">
                  Welcome, {user.name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-chestnut hover:bg-chestnut/5 rounded-lg font-medium touch-manipulation"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;