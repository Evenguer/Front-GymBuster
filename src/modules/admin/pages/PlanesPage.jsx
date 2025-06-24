import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Title,
  Badge,
  Button,
  TextInput,
  Select,
  SelectItem,
  TabGroup,
  TabList,
  Tab,
} from '@tremor/react';
import { PlusCircle, Search, CreditCard } from 'react-feather';
import { useAuth } from '../../../shared/hooks/useAuth';
import { listPlanes, cambiarEstadoPlan } from '../../../shared/services/planAPI';
import PlanModal from '../components/Planes/PlanModal';

const PlanesPage = () => {
  useAuth();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counters, setCounters] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  });

  const fetchPlanes = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await listPlanes(token);
      setPlanes(data);
      
      // Actualizar contadores
      setCounters({
        total: data.length,
        activos: data.filter(plan => plan.estado).length,
        inactivos: data.filter(plan => !plan.estado).length
      });
    } catch (error) {
      console.error('Error al cargar planes:', error);
      toast.error('Error al cargar la lista de planes');
      setError('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const handleToggleStatus = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem('token');
      await cambiarEstadoPlan(id, !estadoActual, token);
      
      setPlanes(planes.map(plan => 
        plan.idPlan === id ? { ...plan, estado: !estadoActual } : plan
      ));
      
      toast.success('Estado del plan actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar el estado del plan');
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleSavePlan = async () => {
    await fetchPlanes();
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const filteredPlanes = planes.filter(plan => {
    const matchesSearch = searchTerm === '' || 
      plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'activos':
        return matchesSearch && plan.estado;
      case 'inactivos':
        return matchesSearch && !plan.estado;
      default:
        return matchesSearch;
    }
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title>Planes y Membresías</Title>
        <Button variant="primary" icon={PlusCircle} onClick={handleCreatePlan}>
          Nuevo Plan
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TextInput
              icon={Search}
              placeholder="Buscar planes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabGroup className="mt-4" onIndexChange={(index) => {
          setActiveTab(['todos', 'activos', 'inactivos'][index]);
        }}>
          <TabList>
            <Tab>Todos ({counters.total})</Tab>
            <Tab>Activos ({counters.activos})</Tab>
            <Tab>Inactivos ({counters.inactivos})</Tab>
          </TabList>
        </TabGroup>

        <Table className="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Descripción</TableHeaderCell>
              <TableHeaderCell>Precio</TableHeaderCell>
              <TableHeaderCell>Duración</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlanes.map((plan) => (
              <TableRow key={plan.idPlan}>
                <TableCell>{plan.nombre}</TableCell>
                <TableCell>{plan.descripcion}</TableCell>
                <TableCell>S/ {plan.precio}</TableCell>
                <TableCell>{plan.duracion} {plan.esDiario ? 'días' : 'meses'}</TableCell>
                <TableCell>
                  <Badge color={plan.tipoPlan === 'PREMIUM' ? 'red' : 'blue'}>
                    {plan.tipoPlan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge color={plan.estado ? 'emerald' : 'gray'}>
                    {plan.estado ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="xs" variant="secondary" onClick={() => handleEditPlan(plan)}>
                      Editar
                    </Button>
                    <Button
                      size="xs"
                      variant="primary"
                      color={plan.estado ? 'red' : 'emerald'}
                      onClick={() => handleToggleStatus(plan.idPlan, plan.estado)}
                    >
                      {plan.estado ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <PlanModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePlan}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PlanesPage;
