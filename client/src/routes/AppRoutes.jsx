import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import Explore from '../pages/Explore';
import Matches from '../pages/Matches';
import Requests from '../pages/Requests';
import Sessions from '../pages/Sessions';
import Reviews from '../pages/Reviews';
import Notifications from '../pages/Notifications';
import Chat from '../pages/Chat';
import NotFound from '../pages/NotFound';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminSkills from '../pages/admin/AdminSkills';
import AdminRequests from '../pages/admin/AdminRequests';
import AdminSessions from '../pages/admin/AdminSessions';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/skills" element={<AdminSkills />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
