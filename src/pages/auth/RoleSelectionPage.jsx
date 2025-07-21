import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, User, Shield, Award } from 'react-feather';
import Logo from '../../assets/LOGO BUSSTER GYM.png';
import { useAuth } from '../../shared/hooks/useAuth';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('');
  const { user, isAuthenticated } = useAuth();
  
  // Verificar si hay información en el estado de la ubicación
  const { email, password } = location.state || {};

  // Obtener la función para cambiar el rol activo
  const { cambiarRolActivo } = useAuth();
  
  // Función para manejar la selección de rol y redirigir
  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    
    // Si el usuario ya está autenticado, cambiamos su rol activo y redirigimos directamente al dashboard
    if (isAuthenticated && user) {
      // Actualizar el rol activo en el contexto de autenticación
      cambiarRolActivo(role);
      
      // Redirigir según el rol seleccionado
      if (role === 'cliente') {
        navigate('/client/dashboard');
      } else if (role === 'empleado') {
        // Redirigir según el rol de empleado específico
        switch(user.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'RECEPCIONISTA':
          case 'ENTRENADOR':
            navigate('/staff/dashboard');
            break;
          default:
            navigate('/staff/dashboard');
        }
      }
    } 
    // Si no está autenticado pero tenemos credenciales, enviamos al login con los datos
    else if (email && password) {
      navigate('/login', { state: { selectedRole: role, email, password } });
    } 
    // Si no hay nada, redirigimos al login con la selección
    else {
      navigate('/login', { state: { selectedRole: role } });
    }
  };
  
  // Función para volver a la página anterior
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img className="h-20 w-auto mb-4" src={Logo} alt="GymBuster Logo" />
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Selecciona tu tipo de acceso
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Elige cómo quieres acceder al sistema
          </p>
        </div>
        
        <div className="mt-6">
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleRoleSelection('empleado')}
              className={`w-full flex items-center justify-center px-4 py-4 border ${
                selectedRole === 'empleado'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              } rounded-md shadow-sm text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              <Shield className="h-6 w-6 text-red-600 mr-3" />
              <span>
                <span className="font-bold block text-left text-lg">Acceder como Empleado</span>
                <span className="text-gray-500 block text-left text-sm">
                  Para Recepcionistas, Entrenadores y Administradores
                </span>
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => handleRoleSelection('cliente')}
              className={`w-full flex items-center justify-center px-4 py-4 border ${
                selectedRole === 'cliente'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              } rounded-md shadow-sm text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              <User className="h-6 w-6 text-red-600 mr-3" />
              <span>
                <span className="font-bold block text-left text-lg">Acceder como Cliente</span>
                <span className="text-gray-500 block text-left text-sm">
                  Para acceder a servicios y planes del gimnasio
                </span>
              </span>
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="button"
            onClick={goBack}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
