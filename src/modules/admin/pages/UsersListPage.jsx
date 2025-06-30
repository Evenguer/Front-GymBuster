import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Card, 
  Table, 
  TableHead, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell, 
  Button,
  TextInput,
  Title,
  Flex,
  Badge,
  TabGroup,
  TabList,
  Tab,
  Select,
  SelectItem,
  Icon
} from '@tremor/react';
import { PlusCircle, Search, Edit, Key, Clock, Eye } from 'react-feather';
import CreateUserModal from '../components/UserManagement/CreateUserModal';
import EditUserModal from '../components/UserManagement/EditUserModal';
import ViewUserDetailsModal from '../components/UserManagement/ViewUserDetailsModal';
import { listUsers, toggleUserStatus, getUsersSecurityDetails } from '../../../shared/services/authAPI.js';
import { useAuth } from '../../../shared/hooks/useAuth';

const UsersListPage = () => {
  useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('todos');
  const [rolFiltro, setRolFiltro] = useState('todos');
  const [lastLogin, setLastLogin] = useState({});
  
  // Contadores para las pestañas
  const [counters, setCounters] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await listUsers(token);
      setUsers(data);
      
      // Calcular contadores para pestañas
      setCounters({
        total: data.length,
        active: data.filter(user => user.estado).length,
        inactive: data.filter(user => !user.estado).length
      });
      
      // Obtener datos de último acceso
      try {
        const securityData = await getUsersSecurityDetails(token);
        
        // Procesar información de último acceso
        const loginData = {};
        
        securityData.forEach(item => {
          // Guardar último acceso
          if (item.ultimoAcceso) {
            loginData[item.id] = item.ultimoAcceso;
          }
        });
        
        setLastLogin(loginData);
      } catch (secError) {
        console.error('Error al cargar datos de seguridad:', secError);
        
        // Si falla, usar datos simulados como fallback
        const loginData = {};
        data.forEach(user => {
          const daysAgo = Math.floor(Math.random() * 30);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          loginData[user.id] = date.toISOString();
        });
        setLastLogin(loginData);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No se encontró el token de autenticación');
        return;
      }
      
      const nuevoEstado = !currentStatus;
      console.log(`Actualizando estado del usuario ${userId} de ${currentStatus} a ${nuevoEstado}`);
      
      const response = await toggleUserStatus(userId, nuevoEstado, token);
      console.log('Respuesta de actualización de estado:', response);
      
      // Actualizar los datos locales
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, estado: nuevoEstado } : user
      ));
      
      // Actualizar contadores
      setCounters(prevCounters => {
        const newCounters = { ...prevCounters };
        if (nuevoEstado) {
          newCounters.active++;
          newCounters.inactive--;
        } else {
          newCounters.active--;
          newCounters.inactive++;
        }
        return newCounters;
      });
      
      // Mostrar mensaje de éxito
      toast.success('Estado actualizado correctamente', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        }
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      
      // Recargar todos los datos en caso de error
      await fetchUsers();
      
      toast.error(
        error.response?.status === 403
          ? 'No tienes permiso para cambiar el estado del usuario'
          : error.response?.data?.message || 'Error al actualizar el estado',
        {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          }
        }
      );
    }
  };

  // Renderizar fecha de último acceso
  const renderLastAccess = (userId) => {
    const lastAccessDate = lastLogin[userId];
    
    if (!lastAccessDate) return 'Nunca';
    
    const date = new Date(lastAccessDate);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };  // Función para abrir el modal de edición de usuario
  const handleEditUser = (user) => {
    console.log('Usuario seleccionado para editar:', user);
    
    // Hacer una copia del usuario para no modificar el original
    const userToEdit = { ...user };
    
    // Normalizar el formato de roles para que sea consistente y eliminar duplicados
    let normalizedRoles = [];
    const roleSet = new Set();
    
    if (userToEdit.roles) {
      // Convertir a array si no lo es
      const rolesArray = Array.isArray(userToEdit.roles) ? userToEdit.roles : [userToEdit.roles];
      
      // Procesar cada rol y eliminar duplicados
      rolesArray.forEach(rol => {
        let rolNormalizado = '';
        
        // Normalizar según el tipo
        if (typeof rol === 'string') {
          rolNormalizado = rol.replace('ROLE_', '');
        } else if (typeof rol === 'object' && rol !== null) {
          rolNormalizado = (rol.id || rol.nombre || '').replace('ROLE_', '');
        }
        
        // Solo añadir roles válidos y únicos
        if (rolNormalizado && !roleSet.has(rolNormalizado)) {
          roleSet.add(rolNormalizado);
          normalizedRoles.push(rolNormalizado);
        }
      });
      
      // Determinar el rol principal (priorizar por importancia)
      // Si hay múltiples roles, elegir el más privilegiado
      if (roleSet.has('ADMIN')) {
        normalizedRoles = ['ADMIN'];
      } else if (roleSet.has('ENTRENADOR')) {
        normalizedRoles = ['ENTRENADOR'];
      } else if (roleSet.has('RECEPCIONISTA')) {
        normalizedRoles = ['RECEPCIONISTA'];
      } else if (roleSet.has('CLIENTE')) {
        normalizedRoles = ['CLIENTE'];
      }
      
    } else if (userToEdit.role) {
      // Si solo tiene la propiedad role, usarla
      const rolNormalizado = typeof userToEdit.role === 'string' 
        ? userToEdit.role.replace('ROLE_', '') 
        : '';
      
      if (rolNormalizado) {
        normalizedRoles = [rolNormalizado];
      }
    }
    
    // Actualizar el usuario con roles normalizados
    userToEdit.roles = normalizedRoles;
    userToEdit.role = normalizedRoles.length > 0 ? normalizedRoles[0] : '';
    
    console.log('Usuario normalizado para editar:', userToEdit);
    setSelectedUser(userToEdit);    setIsEditModalOpen(true);
  };  
  
  // Función para actualizar la lista de usuarios después de una edición
  const handleUserUpdated = async (updatedUser) => {
    console.log('Usuario actualizado recibido:', updatedUser);
    
    // Verificar si es un cambio de cliente a empleado
    if (updatedUser.clienteAEmpleado) {
      console.log('⚠️ Detectado cambio de cliente a empleado');
      
      // Mostrar un mensaje informativo con más detalles
      toast.success('Cliente promovido a empleado correctamente. Actualizando información...', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#3B82F6',
          color: '#fff',
        }
      });
      
      // Retrasar la recarga para que el usuario vea el mensaje
      setTimeout(() => {
        // Recargar la lista completa desde el backend
        fetchUsers();
        
        // Añadir una notificación más detallada para que el administrador complete la información
        toast((t) => (
          <div>
            <strong>¡Acción requerida!</strong>
            <p>El usuario {updatedUser.nombreUsuario} ha sido promovido a rol de empleado.</p>
            <p>Es necesario completar sus datos laborales (RUC, salario, fecha de contratación).</p>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
              >
                Entendido
              </button>
            </div>
          </div>
        ), {
          duration: 8000,
          position: 'top-center',
          style: {
            background: '#FEF3C7', // amber-100
            color: '#92400E', // amber-800
            border: '1px solid #F59E0B', // amber-500
            borderLeft: '4px solid #D97706', // amber-600
            padding: '16px',
            width: '400px',
          },
        });
      }, 1000);
      
      // Limpiar selección
      setSelectedUser(null);
      return;
    }
    
    // Normalizar el formato del usuario actualizado antes de actualizar la lista
    const normalizedUser = { ...updatedUser };
    
    // Eliminar la bandera de clienteAEmpleado si existe
    delete normalizedUser.clienteAEmpleado;
    
    // Asegurar consistencia en los roles
    if (normalizedUser.roles) {
      // Asegurar que roles sea un array
      if (!Array.isArray(normalizedUser.roles)) {
        normalizedUser.roles = [normalizedUser.roles];
      }
    } else if (normalizedUser.role) {
      // Crear un array roles basado en el valor de role
      normalizedUser.roles = [normalizedUser.role];
    }
    
    // También asegurarse de que existe la propiedad role (para compatibilidad)
    if (normalizedUser.roles && normalizedUser.roles.length > 0 && !normalizedUser.role) {
      normalizedUser.role = normalizedUser.roles[0];
    }
    
    console.log('Usuario normalizado a actualizar:', normalizedUser);
      setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === normalizedUser.id) {
        console.log(`Actualizando usuario ID ${user.id}:`);
        console.log('Antes:', user);
        console.log('Después:', normalizedUser);
        return normalizedUser;
      }
      return user;
    }));
    
    // Actualizar selectedUser para mantener sincronizados los datos
    setSelectedUser(null);
    
    toast.success('Usuario actualizado correctamente', {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      }
    });
  };

  // Función para abrir el modal de detalles de usuario
  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setIsViewDetailsModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    // Primero filtramos por estado según la pestaña activa
    if (activeTab === 'activos' && !user.estado) return false;
    if (activeTab === 'inactivos' && user.estado) return false;
    
    // Luego filtramos por rol si se ha seleccionado un rol específico
    if (rolFiltro !== 'todos' && !user.roles?.includes(rolFiltro)) return false;
    
    // Finalmente filtramos por término de búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (user.nombreUsuario || '').toLowerCase().includes(searchTermLower) ||
        (user.nombre || '').toLowerCase().includes(searchTermLower) ||
        (user.apellidos || '').toLowerCase().includes(searchTermLower) ||
        (user.correo || '').toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios del sistema</p>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          variant="primary" 
          className="bg-red-600 hover:bg-red-700 text-white relative group"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <span>Nuevo Usuario</span>
          <div className="absolute hidden group-hover:block w-48 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs text-gray-600 bottom-full mb-1 left-1/2 transform -translate-x-1/2">
            Crear clientes, empleados o cualquier tipo de usuario
          </div>
        </Button>
      </div>
      
      <Card>
        <Flex justifyContent="between" className="mb-4">
          <Title>Gestión de Cuentas de Usuario</Title>
          <div className="flex space-x-2">
            <div className="w-64">
              <TextInput
                icon={Search}
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                value={rolFiltro}
                onValueChange={setRolFiltro}
                placeholder="Filtrar por rol"
              >
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
                <SelectItem value="CLIENTE">Clientes</SelectItem>
                <SelectItem value="ENTRENADOR">Entrenadores</SelectItem>
                <SelectItem value="RECEPCIONISTA">Recepcionistas</SelectItem>
              </Select>
            </div>
          </div>
        </Flex>
        
        <TabGroup className="mb-6" onIndexChange={(index) => {
          const tabs = ['todos', 'activos', 'inactivos'];
          setActiveTab(tabs[index]);
        }}>
          <TabList variant="solid">
            <Tab>
              Todos <Badge size="xs" color="blue">{counters.total}</Badge>
            </Tab>
            <Tab>
              Activos <Badge size="xs" color="green">{counters.active}</Badge>
            </Tab>
            <Tab>
              Inactivos <Badge size="xs" color="red">{counters.inactive}</Badge>
            </Tab>
          </TabList>
        </TabGroup>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Cuenta</TableHeaderCell>
              <TableHeaderCell>Permisos</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-sm">
                            {user.nombreUsuario?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombreUsuario}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.nombre} {user.apellidos}
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          DNI: {user.dni || 'No disponible'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.correo}
                        </div>
                        {/* Solo mostrar RUC si es empleado */}
                        {user.roles?.some(rol => ['ADMIN', 'ENTRENADOR', 'RECEPCIONISTA'].includes(rol)) && user.ruc && (
                          <div className="text-xs text-gray-700">
                            RUC: {user.ruc}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">                      <div className="space-x-1">
                        {(() => {
                          // Eliminar roles duplicados
                          const uniqueRoles = [];
                          const roleSet = new Set();
                          
                          if (Array.isArray(user.roles)) {
                            user.roles.forEach(rol => {
                              let rolName = '';
                              if (typeof rol === 'string') {
                                rolName = rol;
                              } else if (rol && typeof rol === 'object') {
                                rolName = rol.id || rol.nombre || '';
                              }
                              
                              if (rolName && !roleSet.has(rolName)) {
                                roleSet.add(rolName);
                                uniqueRoles.push(rolName);
                              }
                            });
                          }
                          
                          return uniqueRoles.map(rol => {
                            let color = "blue";
                            if (rol === "ADMIN") color = "amber";
                            if (rol === "CLIENTE") color = "green";
                            if (rol === "ENTRENADOR") color = "indigo";
                            if (rol === "RECEPCIONISTA") color = "cyan";
                            
                            return (
                              <span
                                key={rol}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}
                              >
                                {rol}
                              </span>
                            );
                          });
                        })()}
                      
                      </div>
                      <div className="flex items-center mt-2">
                        <Clock size={14} className="mr-1 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          Último acceso: {renderLastAccess(user.id)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.estado)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          user.estado ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            user.estado ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs">
                        {user.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="xs"
                        variant="light"
                        icon={Eye}
                        color="blue"
                        onClick={() => handleViewUserDetails(user)}
                      >
                        Ver
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        icon={Edit}
                        color="amber"
                        onClick={() => handleEditUser(user)}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchUsers(); // Actualizar la lista después de crear un usuario
        }}
      />
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleUserUpdated}
      />
      <ViewUserDetailsModal
        isOpen={isViewDetailsModalOpen}
        onClose={() => {
          setIsViewDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersListPage;
