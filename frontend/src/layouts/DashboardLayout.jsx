import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, MessageSquare, TrendingUp, Bitcoin, DollarSign, Star, LogOut, Activity } from 'lucide-react';

const DashboardLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/chat', icon: MessageSquare },
    { name: 'Stocks', path: '/stocks', icon: TrendingUp },
    { name: 'Crypto', path: '/crypto', icon: Bitcoin },
    { name: 'Forex', path: '/forex', icon: DollarSign },
    { name: 'Watchlist', path: '/watchlist', icon: Star },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b dark:border-gray-700">
          <Activity className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold dark:text-white">FinAdvisor</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold dark:text-white">FinAdvisor</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
