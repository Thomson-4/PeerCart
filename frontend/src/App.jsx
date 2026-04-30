import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomeFeed from './pages/HomeFeed';
import NeedBoard from './pages/NeedBoard';
import AddItem from './pages/AddItem';
import Profile from './pages/Profile';
import ConfirmEmail from './pages/ConfirmEmail';
import MobileUpload from './pages/MobileUpload';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import MyOrders from './pages/MyOrders';
import useTheme from './hooks/useTheme';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Routes>
      <Route path="/login"                element={<Login />} />
      <Route path="/signup"               element={<Signup />} />
      <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
      <Route path="/upload/:token"        element={<MobileUpload />} />

      {/* All pages that share Header + Footer */}
      <Route element={<MainLayout theme={theme} toggleTheme={toggleTheme} />}>
        <Route path="/"               element={<Landing />} />
        <Route path="/feed"           element={<ProtectedRoute><HomeFeed /></ProtectedRoute>} />
        <Route path="/listing/:id"    element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
        <Route path="/needs"          element={<ProtectedRoute><NeedBoard /></ProtectedRoute>} />
        <Route path="/add"            element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/messages"         element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:convId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/orders"           element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
