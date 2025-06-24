// filepath: c:\7MOCICLO\APP_GYM_BACK_FRONT\gym-admin-front\src\pages\auth\LoginPage.jsx
import React from 'react';
import LoginForm from '../../components/common/LoginForm';
import logoImage from '../../assets/LOGO BUSSTER GYM.png';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Panel lateral izquierdo con logo */}
      <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center">
        <div className="text-center p-12">
          <img 
            src={logoImage} 
            alt="BUSSTER GYM Logo" 
            className="mx-auto w-64 select-none pointer-events-none"
            draggable="false"
          />
          <p className="text-white mt-6 text-lg opacity-90 select-none">
            Bienestar y rendimiento en cada entrenamiento
          </p>
        </div>
      </div>
      
      {/* Panel derecho con formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Logo visible solo en móvil */}
          <div className="md:hidden flex justify-center mb-8">
            <img 
              src={logoImage} 
              alt="BUSSTER GYM Logo" 
              className="w-40 select-none pointer-events-none"
              draggable="false"
            />
          </div>
          
          <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            <span className="text-primary-800">Busster</span> GYM
          </h1>
          <p className="text-center text-sm text-gray-600 mb-8">
            Acceso a tu cuenta
          </p>
          
          <LoginForm />
          
          <div className="text-center text-xs text-gray-500 mt-8">
            © {new Date().getFullYear()} Busster GYM. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;