import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import ClienteLayout from './layouts/ClienteLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import DashboardPage from './modules/admin/pages/DashboardPage';
import EmployeesListPage from './modules/admin/pages/EmployeesListPage';
import CategoriasPage from './modules/admin/pages/CategoriasPage';
import UsersListPage from './modules/admin/pages/UsersListPage';
import ClientesListPage from './modules/admin/pages/ClientesListPage';
import PlanesPage from './modules/admin/pages/PlanesPage';
import HorarioPage from './modules/admin/pages/HorarioPage';
import AsistenciaEmpleadoPage from './modules/admin/pages/AsistenciaEmpleadoPage';
import ListaAsistenciaPage from './modules/admin/pages/ListaAsistenciaPage';
import EspecialidadesPage from './modules/admin/pages/EspecialidadesPage';

// Placeholder para páginas pendientes de implementar
const PlaceholderPage = () => (
  <div className="flex justify-center items-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">En Construcción</h2>
      <p className="text-gray-600">Esta página está en desarrollo</p>
    </div>
  </div>
);

const RolesPage = PlaceholderPage;
const HorariosPage = PlaceholderPage;
const AsistenciaPersonalPage = PlaceholderPage;
const EvaluacionPage = PlaceholderPage;
const AsistenciaClientesPage = PlaceholderPage;
const InscripcionesPage = PlaceholderPage;
const DesempenoEntrenadoresPage = PlaceholderPage;
const ReportesGeneralPage = PlaceholderPage;
const ReportesVentasPage = PlaceholderPage;
const ReportesAsistenciaPage = PlaceholderPage;
const ConfiguracionPage = PlaceholderPage;
const ConfiguracionHorariosPage = PlaceholderPage;
const ConfiguracionSistemaPage = PlaceholderPage;
// Staff pages placeholders
const ClientesStaffPage = PlaceholderPage;
const NuevaInscripcionPage = PlaceholderPage;
const GestionarInscripcionesPage = PlaceholderPage;
const RegistrarAsistenciaPage = PlaceholderPage;
const VerAsistenciasPage = PlaceholderPage;
const ProductosStockPage = PlaceholderPage;
const ProductosEquipamientoPage = PlaceholderPage;
const PlanesStaffPage = PlaceholderPage;


// Staff Pages
import StaffDashboardPage from './modules/staff/pages/StaffDashboardPage';
import ProductoPage from './modules/staff/pages/receptionist/ProductoPage';
import CategoriaPage from './modules/staff/pages/receptionist/CategoriaPage';
import VentaPage from './modules/staff/pages/receptionist/VentaPage';
import ListaPage from './modules/staff/pages/receptionist/ListaPage';
import AlquilerPage from './modules/staff/pages/receptionist/AlquilerPage';
import ListaAlquileresPage from './modules/staff/pages/receptionist/ListaAlquileresPage';
import  EspecialidadListaPage from './modules/staff/pages/receptionist/EspecialidadListaPage';
import PlanesListaPage from './modules/staff/pages/receptionist/PlanesListaPage';
import ClienteFormPage from './modules/staff/pages/receptionist/ClienteFormPage';

import TrainerDashboardPage from './modules/staff/pages/trainer/TrainerDashboardPage';
import ClientAttendancePage from './modules/staff/pages/trainer/ClientAttendancePage';
import InscriptionPerformancePage from './modules/staff/pages/trainer/InscriptionPerformancePage';


// Client Pages
import ClientDashboardPage from './modules/client/pages/ClientDashboardPage';
import ClientInscriptionPerformancePage from './modules/client/pages/ClientInscriptionPerformancePage';
import ClientProfilePage from './modules/client/pages/ClientProfilePage';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Rutas de administrador */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']} redirectPath="/login" />
          }>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Gestión de Usuarios */}
              <Route path="usuarios" element={<UsersListPage />} />
              <Route path="empleados" element={<EmployeesListPage />} />
              <Route path="clientes" element={<ClientesListPage />} />
              
              {/* Control de Personal */}
              <Route path="horarios" element={<HorarioPage />} />
              <Route path="asistencia" element={<AsistenciaEmpleadoPage />} />
              <Route path="lista-asistencia" element={<ListaAsistenciaPage />} />
              <Route path="evaluacion" element={<EvaluacionPage />} />
              
              {/* Servicios del Gimnasio */}
              <Route path="categorias" element={<CategoriasPage />} />
              <Route path="especialidades" element={<EspecialidadesPage />} />
              <Route path="planes" element={<PlanesListaPage />} />
              {/* Asistencia y Monitoreo */}
              <Route path="asistencia/clientes" element={<AsistenciaClientesPage />} />
              <Route path="inscripciones" element={<InscripcionesPage />} />
              <Route path="entrenadores/desempeno" element={<DesempenoEntrenadoresPage />} />
              
              {/* Reportes y Análisis */}
              <Route path="reportes/general" element={<ReportesGeneralPage />} />
              <Route path="reportes/ventas" element={<ReportesVentasPage />} />
              <Route path="reportes/asistencia" element={<ReportesAsistenciaPage />} />
              
              {/* Configuración */}
              <Route path="configuracion" element={<ConfiguracionPage />} />
              <Route path="configuracion/horarios" element={<ConfiguracionHorariosPage />} />
              <Route path="configuracion/sistema" element={<ConfiguracionSistemaPage />} />
            </Route>
          </Route>

          {/* Rutas de recepcionista y entrenador */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['RECEPCIONISTA', 'ENTRENADOR']} redirectPath="/login" />
          }>
            <Route element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              {/* Dashboard: muestra el de recepcionista o entrenador según el rol */}
              <Route path="dashboard" element={<StaffDashboardPage />} />
              <Route path="categorias" element={<CategoriaPage />} />
              <Route path="especialidades" element={<EspecialidadListaPage />} />
              <Route path="planes" element={<PlanesListaPage />} />
              <Route path="empleados" element={<EmployeesListPage />} />
              <Route path="clientes" element={<ClientesListPage />} />
              <Route path="productos" element={<ProductoPage />} />
              <Route path="productos/stock" element={<ProductosStockPage />} />
              <Route path="productos/equipamiento" element={<ProductosEquipamientoPage />} />
              <Route path="ventas" element={<VentaPage/>} />
              <Route path="listas" element={<ListaPage />} />
              <Route path="alquileres/nuevo" element={<AlquilerPage />} />
              <Route path="alquileres/historial" element={<ListaAlquileresPage />} />
              <Route path="clientes" element={<ClientesStaffPage />} />
              <Route path="cliente/nuevo" element={<ClienteFormPage />} />
              <Route path="inscripciones/nueva" element={<NuevaInscripcionPage />} />
              <Route path="inscripciones/gestionar" element={<GestionarInscripcionesPage />} />
              <Route path="asistencias/registrar" element={<RegistrarAsistenciaPage />} />
              <Route path="asistencias/ver" element={<VerAsistenciasPage />} />
              <Route path="planes" element={<PlanesStaffPage />} />
              {/* Rutas específicas para ENTRENADOR */}
              <Route path="clientes/asistencia" element={<ClientAttendancePage />} />
              <Route path="inscripciones/desempeno" element={<InscriptionPerformancePage />} />
              {/* Aquí irán las demás rutas de staff */}
            </Route>
          </Route>

          {/* Rutas de cliente */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['CLIENTE']} redirectPath="/login" />
          }>
            <Route element={<ClienteLayout />}>
              <Route index element={<Navigate to="/client/dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="inscripciones/desempeno" element={<ClientInscriptionPerformancePage />} />
              <Route path="perfil" element={<ClientProfilePage />} />
              {/* Aquí irán las demás rutas de cliente */}
            </Route>
          </Route>
          
          {/* Redirección de la raíz al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Página 404 para rutas no encontradas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
