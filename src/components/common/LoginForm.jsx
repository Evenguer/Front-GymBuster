import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    contrasena: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    if (error) {
      clearError();
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.nombreUsuario) {
      errors.nombreUsuario = 'El nombre de usuario es requerido';
    }
    if (!formData.contrasena) {
      errors.contrasena = 'La contraseña es requerida';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const user = await login(formData);
      
      // Redirigir según el rol del usuario
      switch(user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'RECEPCIONISTA':
          navigate('/staff/dashboard');
          break;
        case 'ENTRENADOR':
          navigate('/staff/dashboard');
          break;
        case 'CLIENTE':
          navigate('/client/dashboard');
          break;
        default:
          navigate('/login');
      }
    } catch (error) {
      console.error('Error de login:', error);
      // El error ya se maneja en el AuthContext y se muestra en la UI
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-red-800">
      {/* Mensaje para desarrollo - quitar en producción */}
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded" role="alert">
        <p className="font-medium">Conectado al backend en:</p>
        <p className="text-xs break-all">http://localhost:8080/api/auth/login</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700 mb-1">
            Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleChange}
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 ${
                formErrors.nombreUsuario ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre de usuario"
            />
          </div>
          {formErrors.nombreUsuario && (
            <p className="mt-1 text-sm text-red-600">{formErrors.nombreUsuario}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 ${
                formErrors.contrasena ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="********"
            />
          </div>
          {formErrors.contrasena && (
            <p className="mt-1 text-sm text-red-600">{formErrors.contrasena}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 transition duration-300"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default LoginForm;