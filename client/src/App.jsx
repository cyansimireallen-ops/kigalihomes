import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import { ProtectedRoute, AdminRoute, OwnerRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Rent from './pages/Rent';
import Buy from './pages/Buy';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Favorites from './pages/Favorites';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import DashboardHome from './pages/dashboard/DashboardHome';
import MyListings from './pages/dashboard/MyListings';
import AddEditProperty from './pages/dashboard/AddEditProperty';
import Messages from './pages/dashboard/Messages';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';

import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminContent from './pages/admin/AdminContent';

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Admin auth (outside AdminLayout - no sidebar) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      {/* Admin dashboard (protected) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/new" element={<AddEditProperty />} />
        <Route path="properties/:id/edit" element={<AddEditProperty />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="messages" element={<Messages />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* User dashboard (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="listings" element={<OwnerRoute><MyListings /></OwnerRoute>} />
        <Route path="listings/new" element={<OwnerRoute><AddEditProperty /></OwnerRoute>} />
        <Route path="listings/:id/edit" element={<OwnerRoute><AddEditProperty /></OwnerRoute>} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
