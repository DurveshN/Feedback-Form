import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
