import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Trade View</h1>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/day-view"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Day View</h1>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notebook"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Notebook</h1>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Reports</h1>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Progress Tracker</h1>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
