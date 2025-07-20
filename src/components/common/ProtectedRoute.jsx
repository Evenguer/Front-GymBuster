import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Si está cargando, muestra un spinner o loading
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>;
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos y el usuario no tiene el rol adecuado
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo está bien, renderiza los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;