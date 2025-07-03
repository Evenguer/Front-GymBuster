

import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, Flex, Badge } from '@tremor/react';
import { Users, DollarSign, Home, UserCheck, UserX } from 'react-feather';
// import { ventasAPI } from '../../services/ventaAPI';
// import { alquilerAPI } from '../../services/alquilerAPI';
// import { listClients, listEmployees } from '../../../../shared/services/authAPI';
// import { asistenciaEmpleadoAPI } from '../../../admin/services/asistenciaEmpleadoAPI';

const DashboardRecepcion = () => {
  // Datos simulados para el dashboard
  const [stats] = useState({
    gananciaVentas: 1250,
    gananciaAlquileres: 320,
    clientesActivos: 42,
  });
  const [ultimosAlquileres] = useState([
    { cliente: 'Juan Pérez', monto: 120, fecha: '2025-06-30', producto: 'Alquiler de locker' },
    { cliente: 'Ana Torres', monto: 200, fecha: '2025-06-30', producto: 'Alquiler de toalla' },
  ]);
  const [ultimasVentas] = useState([
    { cliente: 'Juan Pérez', monto: 500, fecha: '2025-06-30', producto: 'Membresía mensual' },
    { cliente: 'Carlos Ruiz', monto: 750, fecha: '2025-06-30', producto: 'Suplementos' },
  ]);
  const [empleadosAsistieron] = useState([
    { nombre: 'María López', rol: 'Recepcionista' },
    { nombre: 'Pedro Gómez', rol: 'Entrenador' },
  ]);
  const [empleadosNoAsistieron] = useState([
    { nombre: 'Lucía Fernández', rol: 'Limpieza' },
  ]);
  const [loading] = useState(false);

  // useEffect eliminado: dashboard ahora usa datos simulados

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Recepción</h1>
        <p className="text-gray-500">Resumen diario de actividad y gestión</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card decoration="top" decorationColor="emerald">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-emerald-100 rounded-md">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            <div>
              <Text>Ganancia diaria por ventas</Text>
              <Metric>S/ {stats.gananciaVentas}</Metric>
            </div>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-blue-100 rounded-md">
              <Home size={20} className="text-blue-500" />
            </div>
            <div>
              <Text>Ganancia diaria por alquiler</Text>
              <Metric>S/ {stats.gananciaAlquileres}</Metric>
            </div>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="indigo">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-indigo-100 rounded-md">
              <Users size={20} className="text-indigo-500" />
            </div>
            <div>
              <Text>Clientes activos</Text>
              <Metric>{stats.clientesActivos}</Metric>
            </div>
          </Flex>
        </Card>
      </div>

      {/* Últimos movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Últimos Alquileres</Title>
          <div className="mt-4 space-y-3">
            {ultimosAlquileres.length === 0 ? (
              <Text>No hay alquileres recientes</Text>
            ) : ultimosAlquileres.map((a, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">
                    {a.cliente?.nombre || a.clienteNombre || a.cliente || '-'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.producto?.nombre || a.productoNombre || a.producto || '-'}
                    {a.fecha ? ` - ${a.fecha}` : ''}
                  </p>
                </div>
                <Badge color="blue">S/ {a.montoTotal || a.monto || '-'}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Title>Últimas Ventas</Title>
          <div className="mt-4 space-y-3">
            {ultimasVentas.length === 0 ? (
              <Text>No hay ventas recientes</Text>
            ) : ultimasVentas.map((v, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">
                    {v.cliente?.nombre || v.clienteNombre || v.cliente || '-'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {v.producto?.nombre || v.productoNombre || v.producto || '-'}
                    {v.fecha ? ` - ${v.fecha}` : ''}
                  </p>
                </div>
                <Badge color="emerald">S/ {v.montoTotal || v.monto || '-'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Asistencia de empleados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Empleados que asistieron hoy</Title>
          <div className="mt-4 space-y-2">
            {empleadosAsistieron.length === 0 ? (
              <Text>Ningún empleado asistió hoy</Text>
            ) : empleadosAsistieron.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <UserCheck size={16} className="text-green-500" />
                <span>
                  {e.nombre || e.nombres || e.nombreEmpleado || e.username || '-'}
                  <span className="text-xs text-gray-500"> ({e.rol || e.rolNombre || e.cargo || (e.roles && e.roles[0]) || ''})</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Title>Empleados que no asistieron</Title>
          <div className="mt-4 space-y-2">
            {empleadosNoAsistieron.length === 0 ? (
              <Text>Todos los empleados asistieron</Text>
            ) : empleadosNoAsistieron.map((e, i) => (
              <div key={i} className="flex items-center gap-2">
                <UserX size={16} className="text-red-500" />
                <span>
                  {e.nombre || e.nombres || e.nombreEmpleado || e.username || '-'}
                  <span className="text-xs text-gray-500"> ({e.rol || e.rolNombre || e.cargo || (e.roles && e.roles[0]) || ''})</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardRecepcion;
