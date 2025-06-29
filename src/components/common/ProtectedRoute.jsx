import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login' 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Log de debug para ver qué está sucediendo
  console.log('ProtectedRoute - Path:', location.pathname);
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);
  
  // Si está cargando, muestra un spinner o loading
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
    </div>;
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('ProtectedRoute - No autenticado, redirigiendo a:', redirectPath);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos y el usuario no tiene el rol adecuado
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Rol no permitido, redirigiendo a /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // Si todo está bien, renderiza los componentes hijos
  console.log('ProtectedRoute - Acceso permitido');
  return <Outlet />;
};

export default ProtectedRoute;