import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboard from './pages/AdminDashboard';
import OrganiserDashboard from './pages/OrganiserDashboard';
import WaitlistAcceptPage from './pages/WaitlistAcceptPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/"              element={<HomePage />} />
            <Route path="/events"        element={<HomePage />} />
            <Route path="/about"         element={<AboutPage />} />
            <Route path="/contact"       element={<ContactPage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/events/:id"    element={<EventDetailPage />} />
            <Route path="/waitlist/accept" element={<WaitlistAcceptPage />} />

            {/* Customer only */}
            <Route path="/checkout/:eventId"
              element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>}
            />
            <Route path="/my-bookings"
              element={<ProtectedRoute roles={['customer']}><MyBookingsPage /></ProtectedRoute>}
            />
            <Route path="/profile"
              element={<ProtectedRoute roles={['customer','organiser','admin']}><ProfilePage /></ProtectedRoute>}
            />

            {/* Admin only */}
            <Route path="/admin"
              element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
            />

            {/* Organiser + Admin */}
            <Route path="/organiser"
              element={<ProtectedRoute roles={['organiser', 'admin']}><OrganiserDashboard /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
