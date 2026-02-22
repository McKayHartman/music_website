import { Navigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../utils/auth.js';

export default function RequireAdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/my-account" replace />;
  }

  return children;
}
