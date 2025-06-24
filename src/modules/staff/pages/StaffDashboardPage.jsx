import React from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';

const StaffDashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'ENTRENADOR') {
    // Panel de Entrenador
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Control - Entrenador</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Clientes Activos</h2>
            {/* Aquí puedes mostrar una lista o tabla de clientes activos */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Planes Asignados</h2>
            {/* Aquí puedes mostrar los planes en los que trabaja el entrenador */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Resumen de Actividad</h2>
            {/* Aquí puedes mostrar un resumen de actividad del entrenador */}
          </div>
        </div>
      </div>
    );
  }

  // Panel de Recepcionista
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Control - Recepción</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Resumen del Día</h2>
          {/* Contenido del dashboard */}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Actividades Pendientes</h2>
          {/* Lista de actividades */}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Últimas Ventas</h2>
          {/* Lista de ventas recientes */}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
