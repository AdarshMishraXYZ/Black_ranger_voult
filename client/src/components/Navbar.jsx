import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');

  const navItems = [
    { path: '/create-identity', label: 'Create Identity' },
    { path: '/generate-qr', label: 'Generate QR' },
    { path: '/verify-qr', label: 'Verify QR' },
    { path: '/logs', label: 'Verification Logs' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="glass-card border-b border-neon-cyan/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold neon-text">BLACK RANGER</span>
              <span className="text-sm text-gray-400">Identity Vault</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'neon-text bg-neon-cyan/10 border border-neon-cyan/30'
                      : 'text-gray-300 hover:text-neon-cyan'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'EN' ? 'ES' : 'EN')}
                className="px-3 py-1 text-sm border border-neon-cyan/30 rounded-lg hover:bg-neon-cyan/10 transition-all"
              >
                {language}
              </button>

              {/* Auth */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-sm text-gray-400">{user.email}</div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm neon-button"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 text-sm neon-button"
                >
                  Login
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-neon-cyan"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'neon-text bg-neon-cyan/10 border border-neon-cyan/30'
                      : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Navbar;

