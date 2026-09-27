import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Stocks from './pages/Stocks';
import { Loader2 } from 'lucide-react';

// Simple placeholder components for other routes
const Crypto = () => <div className="p-4"><h1 className="text-2xl font-bold dark:text-white mb-4">Crypto</h1><p className="dark:text-gray-300">Use the Chat assistant to query crypto data like "Tell me about Bitcoin."</p></div>;
const Forex = () => <div className="p-4"><h1 className="text-2xl font-bold dark:text-white mb-4">Forex</h1><p className="dark:text-gray-300">Use the Chat assistant to query forex data like "Convert USD to EUR."</p></div>;
const Watchlist = () => <div className="p-4"><h1 className="text-2xl font-bold dark:text-white mb-4">Watchlist</h1><p className="dark:text-gray-300">Watchlist feature coming soon.</p></div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="stocks" element={<Stocks />} />
        <Route path="crypto" element={<Crypto />} />
        <Route path="forex" element={<Forex />} />
        <Route path="watchlist" element={<Watchlist />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
