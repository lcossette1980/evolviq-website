import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, Crown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, setIsLoginModalOpen, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'services', label: 'Services', path: '/services' },
    { id: 'projects', label: 'Projects', path: '/projects' },
    { id: 'blog', label: 'Blog', path: '/blog' },
    { id: 'membership', label: 'Membership', path: '/membership' }
  ];

  const currentPath = location.pathname;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-khaki/10 sticky top-0 z-50 shadow-sm">
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
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative font-medium transition-all duration-200 px-3 py-2 rounded-lg touch-manipulation min-h-[44px] flex items-center ${
                  currentPath === item.path 
                    ? 'text-chestnut bg-chestnut/5' 
                    : 'text-charcoal hover:text-chestnut hover:bg-chestnut/5'
                }`}
              >
                {item.label}
                {currentPath === item.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-chestnut rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-chestnut/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-chestnut" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-charcoal">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      {user.isPremium ? (
                        <>
                          <Crown className="w-3 h-3 mr-1 text-yellow-500" />
                          Premium
                        </>
                      ) : (
                        'Free'
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-charcoal hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/account');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-charcoal hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Account Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
                
                {/* Click outside to close */}
                {isUserMenuOpen && (
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-chestnut text-white px-6 py-2 rounded-lg hover:bg-chestnut/90 transition-all duration-200 font-medium shadow-sm hover:shadow touch-manipulation min-h-[44px]"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-chestnut p-2 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <div className="px-4 pt-4 pb-6 space-y-2 bg-white shadow-lg border-b border-khaki/20">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`block px-4 py-4 text-base font-medium w-full text-left rounded-lg transition-colors touch-manipulation min-h-[44px] ${
                  currentPath === item.path 
                    ? 'text-chestnut bg-chestnut/10' 
                    : 'text-charcoal hover:text-chestnut hover:bg-chestnut/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-4 text-base font-medium bg-chestnut text-white rounded-lg mt-4 touch-manipulation hover:bg-chestnut/90 transition-colors min-h-[44px]"
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
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-4 text-charcoal hover:bg-chestnut/5 rounded-lg font-medium touch-manipulation min-h-[44px]"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate('/account');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-4 text-charcoal hover:bg-chestnut/5 rounded-lg font-medium touch-manipulation min-h-[44px]"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-4 text-chestnut hover:bg-chestnut/5 rounded-lg font-medium touch-manipulation min-h-[44px]"
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