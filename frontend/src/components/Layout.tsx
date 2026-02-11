import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/trades', label: 'Trade View' },
    { path: '/day-view', label: 'Day View' },
    { path: '/notebook', label: 'Notebook' },
    { path: '/reports', label: 'Reports' },
    { path: '/progress', label: 'Progress Tracker' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">HYPRLYNK</h1>
          <p className="text-sm text-gray-500">Trade Portal</p>
        </div>

        <button className="w-full mx-4 mb-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors" style={{ width: 'calc(100% - 2rem)' }}>
          + Add Trade
        </button>

        <nav className="px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 mb-1 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default Layout;
