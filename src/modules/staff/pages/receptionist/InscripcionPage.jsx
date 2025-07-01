import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { inscripcionAPI } from '../../services/InscripcionAPI';
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
  Text,
  SearchSelect,
  SearchSelectItem,
  NumberInput,
  DatePicker
} from '@tremor/react';
import { 
  Search, 
  CreditCard, 
  User, 
  Calendar, 
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import {
  Snackbar,
  Alert
} from '@mui/material';

const InscripcionPage = () => {
  const { isAuthenticated } = useAuth();
  
  // Estados principales
  const [dni, setDni] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [instructorSeleccionado, setInstructorSeleccionado] = useState(null);
  const [horariosInstructor, setHorariosInstructor] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  
  // Datos de formulario
  const [formData, setFormData] = useState({
    idCliente: '',
    idPlan: '',
    idInstructor: null,
    fechaInicio: new Date(),
    monto: 0
  });
  
  // Datos para listas
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [instructoresDisponibles, setInstructoresDisponibles] = useState([]);
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [inscripcionCreada, setInscripcionCreada] = useState(null);
  const [pasoActual, setPasoActual] = useState(1); // 1: Cliente, 2: Plan, 3: Instructor, 4: Horario, 5: Confirmación, 6: Pago, 7: Finalizado
  
  // Estados de pago
  const [montoPagado, setMontoPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mostrarPago, setMostrarPago] = useState(false);
  
  // Estados de notificación
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const [clientesData, planesData] = await Promise.all([
          inscripcionAPI.obtenerClientes(),
          inscripcionAPI.obtenerPlanes()
        ]);

        // Formatear clientes
        const clientesFormateados = clientesData
          .filter(cliente => cliente && cliente.estado)
          .map(cliente => ({
            id: cliente.id,
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            nombreCompleto: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim(),
            dni: cliente.dni || ''
          }));

        // Formatear planes
        const planesFormateados = planesData
          .filter(plan => plan && plan.estado)
          .map(plan => ({
            id: plan.idPlan,
            nombre: plan.nombre,
            precio: plan.precio,
            duracion: plan.duracion,
            tipoPlan: plan.tipoPlan
          }));

        setClientes(clientesFormateados);
        setPlanes(planesFormateados);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setFormErrors({ fetch: 'Error al cargar los datos: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Buscar cliente por DNI
  const buscarClientePorDNI = async () => {
    if (!dni.trim()) {
      setFormErrors({ dni: 'Ingrese un DNI válido' });
      return;
    }

    try {
      setLoading(true);
      setFormErrors({});
      
      const cliente = clientes.find(c => c.dni === dni);
      if (cliente) {
        setClienteEncontrado(cliente);
        setFormData(prev => ({ ...prev, idCliente: cliente.id }));
        setPasoActual(2); // Avanzar al paso de selección de plan
        showSnackbar('Cliente encontrado exitosamente', 'success');
      } else {
        setFormErrors({ dni: 'No se encontró un cliente con ese DNI' });
        setClienteEncontrado(null);
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      setFormErrors({ dni: 'Error al buscar el cliente' });
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar plan
  const seleccionarPlan = async (planId) => {
    try {
      setLoading(true);
      const plan = planes.find(p => p.id === parseInt(planId));
      
      if (plan) {
        setPlanSeleccionado(plan);
        setFormData(prev => ({ 
          ...prev, 
          idPlan: plan.id,
          monto: plan.precio
        }));

        // Si es plan PREMIUM, cargar instructores disponibles
        if (plan.tipoPlan === 'PREMIUM') {
          const instructores = await inscripcionAPI.obtenerInstructoresDisponibles(plan.id);
          setInstructoresDisponibles(instructores);
          setPasoActual(3); // Paso de selección de instructor
        } else {
          // Si es ESTANDAR, saltar a confirmación
          setPasoActual(5); // Paso de confirmación
        }
        
        showSnackbar('Plan seleccionado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error al seleccionar plan:', error);
      showSnackbar('Error al seleccionar el plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar instructor (solo para planes PREMIUM)
  const seleccionarInstructor = async (instructorId) => {
    try {
      setLoading(true);
      const instructor = instructoresDisponibles.find(i => i.idEmpleado === parseInt(instructorId));
      
      if (instructor) {
        setInstructorSeleccionado(instructor);
        setFormData(prev => ({ ...prev, idInstructor: instructor.idEmpleado }));
        
        // Cargar horarios del instructor
        const horarios = await inscripcionAPI.obtenerHorariosInstructor(instructor.idEmpleado);
        setHorariosInstructor(horarios);
        setPasoActual(4); // Paso de selección de horario
        
        showSnackbar('Instructor seleccionado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error al seleccionar instructor:', error);
      showSnackbar('Error al seleccionar el instructor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar horario
  const seleccionarHorario = (horario) => {
    setHorarioSeleccionado(horario);
    setPasoActual(5); // Paso de confirmación
    showSnackbar('Horario seleccionado exitosamente', 'success');
  };

  // Registrar inscripción
  const registrarInscripcion = async () => {
    try {
      setLoading(true);
      
      const inscripcionData = {
        idCliente: formData.idCliente,
        idPlan: formData.idPlan,
        idInstructor: formData.idInstructor,
        fechaInicio: formData.fechaInicio instanceof Date 
          ? formData.fechaInicio.toISOString().split('T')[0]
          : formData.fechaInicio,
        monto: formData.monto
      };

      console.log('Datos de inscripción a enviar:', inscripcionData);
      
      const resultado = await inscripcionAPI.registrarInscripcion(inscripcionData);
      setInscripcionCreada(resultado);
      setPasoActual(6); // Paso de pago
      
      showSnackbar('Inscripción registrada exitosamente', 'success');
    } catch (error) {
      console.error('Error al registrar inscripción:', error);
      showSnackbar(error.message || 'Error al registrar la inscripción', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Registrar pago
  const registrarPago = async () => {
    if (!montoPagado || parseFloat(montoPagado) < formData.monto) {
      setFormErrors({ pago: 'El monto pagado debe ser igual o mayor al monto de la inscripción' });
      return;
    }

    try {
      setLoading(true);
      
      const pagoData = {
        inscripcion: { idInscripcion: inscripcionCreada.idInscripcion },
        montoPagado: parseFloat(montoPagado),
        metodoPago: metodoPago
      };

      await inscripcionAPI.registrarPagoInscripcion(pagoData);
      setPasoActual(7); // Paso final
      
      showSnackbar('Pago registrado exitosamente', 'success');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      showSnackbar(error.message || 'Error al registrar el pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const reiniciarFormulario = () => {
    setDni('');
    setClienteEncontrado(null);
    setPlanSeleccionado(null);
    setInstructorSeleccionado(null);
    setHorariosInstructor([]);
    setHorarioSeleccionado(null);
    setFormData({
      idCliente: '',
      idPlan: '',
      idInstructor: null,
      fechaInicio: new Date(),
      monto: 0
    });
    setInscripcionCreada(null);
    setMontoPagado('');
    setMetodoPago('EFECTIVO');
    setFormErrors({});
    setPasoActual(1);
  };

  const volver = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  // Componente de progreso
  const ProgresoInscripcion = ({ pasoActual }) => {
    const pasos = [
      { numero: 1, titulo: 'Cliente', icono: User },
      { numero: 2, titulo: 'Plan', icono: Calendar },
      { numero: 3, titulo: 'Instructor', icono: User, condicional: true },
      { numero: 4, titulo: 'Horario', icono: Clock, condicional: true },
      { numero: 5, titulo: 'Confirmación', icono: CheckCircle },
      { numero: 6, titulo: 'Pago', icono: CreditCard },
      { numero: 7, titulo: 'Completado', icono: CheckCircle }
    ];

    // Filtrar pasos según el tipo de plan
    const pasosFiltrados = pasos.filter(paso => {
      if (paso.condicional && planSeleccionado?.tipoPlan !== 'PREMIUM') {
        return false;
      }
      return true;
    });

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between relative">
          {pasosFiltrados.map((paso, index) => {
            const IconComponent = paso.icono;
            return (
              <div key={paso.numero} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    paso.numero === pasoActual ? 'border-red-600 bg-red-50 text-red-600' : 
                    paso.numero < pasoActual ? 'border-red-500 bg-red-500 text-white' : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {paso.numero < pasoActual ? (
                    <CheckCircle size={20} />
                  ) : (
                    <IconComponent size={16} />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${paso.numero <= pasoActual ? 'text-red-600' : 'text-gray-400'}`}>
                  {paso.titulo}
                </span>
              </div>
            );
          })}
          
          {/* Línea de progreso */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${((pasoActual - 1) / (pasosFiltrados.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title>Registro de Inscripción</Title>
        {pasoActual > 1 && pasoActual < 7 && (
          <div className="flex gap-2">
            <Button 
              onClick={volver}
              variant="secondary"
              icon={ArrowLeft}
              size="sm"
            >
              Volver
            </Button>
            <Button 
              onClick={reiniciarFormulario} 
              variant="secondary"
              color="gray"
              size="sm"
            >
              Nueva Inscripción
            </Button>
          </div>
        )}
      </div>
      
      <ProgresoInscripcion pasoActual={pasoActual} />
      
      {formErrors.fetch && (
        <Alert severity="error" className="mb-4">
          {formErrors.fetch}
        </Alert>
      )}

      {/* Paso 1: Búsqueda de Cliente */}
      {pasoActual === 1 && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <User size={20} className="mr-2 text-red-600" />
            <span>Buscar Cliente</span>
          </Title>
          
          <div className="mb-5 p-4 bg-gray-50 rounded-lg">
            <Text className="mb-2 font-medium">Buscar cliente por DNI</Text>
            <div className="flex gap-2">
              <TextInput
                placeholder="Ingrese DNI del cliente"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                error={!!formErrors.dni}
                errorMessage={formErrors.dni}
                icon={User}
                className="flex-1 bg-white"
                onKeyPress={(e) => e.key === 'Enter' && buscarClientePorDNI()}
              />
              <Button 
                onClick={buscarClientePorDNI} 
                disabled={loading || !dni.trim()}
                loading={loading}
                icon={Search}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Buscar
              </Button>
            </div>
          </div>
          
          {clienteEncontrado && (
            <div className="mb-4 p-3 border border-green-200 bg-green-50 rounded">
              <Text>
                <CheckCircle className="inline-block mr-2 text-green-600" size={16} /> 
                Cliente encontrado: <strong>{clienteEncontrado.nombreCompleto}</strong> (DNI: {clienteEncontrado.dni})
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Paso 2: Selección de Plan */}
      {pasoActual === 2 && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <Calendar size={20} className="mr-2 text-red-600" />
            <span>Seleccionar Plan</span>
          </Title>
          
          {clienteEncontrado && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
              <Text className="text-blue-700">
                Cliente: <strong>{clienteEncontrado.nombreCompleto}</strong>
              </Text>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planes.map(plan => (
              <div 
                key={plan.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                onClick={() => seleccionarPlan(plan.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{plan.nombre}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    plan.tipoPlan === 'PREMIUM' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {plan.tipoPlan}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>💰 Precio: S/ {plan.precio}</p>
                  <p>📅 Duración: {plan.duracion} días</p>
                </div>
                <Button 
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                  disabled={loading}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Paso 3: Selección de Instructor (solo para PREMIUM) */}
      {pasoActual === 3 && planSeleccionado?.tipoPlan === 'PREMIUM' && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <User size={20} className="mr-2 text-red-600" />
            <span>Seleccionar Instructor</span>
          </Title>
          
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <Text className="text-blue-700">
              Plan seleccionado: <strong>{planSeleccionado.nombre}</strong> - S/ {planSeleccionado.precio}
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instructoresDisponibles.map(instructor => (
              <div 
                key={instructor.idEmpleado}
                className="p-4 border rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                onClick={() => seleccionarInstructor(instructor.idEmpleado)}
              >
                <h3 className="font-semibold text-lg mb-2">{instructor.nombre}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>👨‍🏫 Tipo: {instructor.tipoInstructor}</p>
                  <p>👥 Cupo disponible: {instructor.cupoMaximo}</p>
                </div>
                <Button 
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                  disabled={loading}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Paso 4: Selección de Horario */}
      {pasoActual === 4 && instructorSeleccionado && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-red-600" />
            <span>Seleccionar Horario</span>
          </Title>
          
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
            <Text className="text-blue-700">
              Instructor seleccionado: <strong>{instructorSeleccionado.nombre}</strong>
            </Text>
          </div>
          
          {horariosInstructor.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Día</TableHeaderCell>
                  <TableHeaderCell>Hora Inicio</TableHeaderCell>
                  <TableHeaderCell>Hora Fin</TableHeaderCell>
                  <TableHeaderCell>Acción</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {horariosInstructor.map((horario, index) => (
                  <TableRow key={index}>
                    <TableCell>{horario.dia}</TableCell>
                    <TableCell>{horario.horaInicio}</TableCell>
                    <TableCell>{horario.horaFin}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={() => seleccionarHorario(horario)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-center border border-gray-200 rounded">
              <Text>No hay horarios disponibles para este instructor</Text>
            </div>
          )}
        </Card>
      )}

      {/* Paso 5: Confirmación */}
      {pasoActual === 5 && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-red-600" />
            <span>Confirmar Inscripción</span>
          </Title>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Resumen de la Inscripción</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Cliente:</strong> {clienteEncontrado?.nombreCompleto}</p>
                <p><strong>Plan:</strong> {planSeleccionado?.nombre} ({planSeleccionado?.tipoPlan})</p>
                <p><strong>Duración:</strong> {planSeleccionado?.duracion} días</p>
                {instructorSeleccionado && (
                  <p><strong>Instructor:</strong> {instructorSeleccionado.nombre}</p>
                )}
                {horarioSeleccionado && (
                  <p><strong>Horario:</strong> {horarioSeleccionado.dia} - {horarioSeleccionado.horaInicio} a {horarioSeleccionado.horaFin}</p>
                )}
                <p><strong>Fecha de inicio:</strong> {formData.fechaInicio instanceof Date ? formData.fechaInicio.toLocaleDateString() : formData.fechaInicio}</p>
                <p className="text-lg font-semibold text-red-600"><strong>Monto total: S/ {formData.monto}</strong></p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Fecha de inicio (opcional - modificar si es necesario)</Text>
              <DatePicker
                value={formData.fechaInicio}
                onValueChange={(value) => setFormData(prev => ({ ...prev, fechaInicio: value }))}
                enableClear={false}
                minDate={new Date()}
                icon={Calendar}
                className="bg-white max-w-xs"
              />
            </div>
            
            <Button 
              onClick={registrarInscripcion}
              disabled={loading}
              loading={loading}
              icon={CheckCircle}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Confirmar y Registrar Inscripción
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 6: Pago */}
      {pasoActual === 6 && inscripcionCreada && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <CreditCard size={20} className="mr-2 text-red-600" />
            <span>Registrar Pago</span>
          </Title>
          
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <Text className="text-green-700">
              <CheckCircle className="inline-block mr-2" size={16} />
              Inscripción registrada exitosamente. ID: {inscripcionCreada.idInscripcion}
            </Text>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Método de pago</Text>
              <SearchSelect
                value={metodoPago}
                onValueChange={setMetodoPago}
                disabled={loading}
                icon={CreditCard}
                className="bg-white"
              >
                <SearchSelectItem value="EFECTIVO">Efectivo</SearchSelectItem>
                <SearchSelectItem value="TARJETA">Tarjeta</SearchSelectItem>
                <SearchSelectItem value="YAPE">Yape</SearchSelectItem>
                <SearchSelectItem value="PLIN">Plin</SearchSelectItem>
              </SearchSelect>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Text className="mb-2 font-medium">Monto recibido (S/)</Text>
              <TextInput
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                disabled={loading}
                type="number"
                step="0.01"
                min={formData.monto}
                placeholder={`Mínimo: S/ ${formData.monto.toFixed(2)}`}
                className="bg-white"
                icon={DollarSign}
              />
              {formErrors.pago && (
                <Text className="text-red-600 text-xs mt-1">{formErrors.pago}</Text>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <Text className="text-lg font-semibold text-blue-800">
                Total a pagar: S/ {formData.monto.toFixed(2)}
              </Text>
              {montoPagado && parseFloat(montoPagado) > formData.monto && (
                <Text className="text-green-600 font-medium">
                  Vuelto: S/ {(parseFloat(montoPagado) - formData.monto).toFixed(2)}
                </Text>
              )}
            </div>
            <Button 
              onClick={registrarPago} 
              disabled={loading || !montoPagado || parseFloat(montoPagado) < formData.monto}
              loading={loading}
              icon={CheckCircle}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Finalizar Pago
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 7: Completado */}
      {pasoActual === 7 && (
        <Card className="mb-6 shadow-sm">
          <div className="text-center py-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <Title className="mb-2 text-green-700">¡Inscripción Completada!</Title>
            <Text className="mb-6 text-gray-600">
              La inscripción y el pago han sido registrados exitosamente.
            </Text>
            
            <div className="max-w-md mx-auto mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="font-semibold mb-2">Detalles de la inscripción:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>ID:</strong> {inscripcionCreada?.idInscripcion}</p>
                <p><strong>Cliente:</strong> {clienteEncontrado?.nombreCompleto}</p>
                <p><strong>Plan:</strong> {planSeleccionado?.nombre}</p>
                <p><strong>Monto:</strong> S/ {formData.monto.toFixed(2)}</p>
                <p><strong>Método de pago:</strong> {metodoPago}</p>
                {montoPagado && parseFloat(montoPagado) > formData.monto && (
                  <p><strong>Vuelto:</strong> S/ {(parseFloat(montoPagado) - formData.monto).toFixed(2)}</p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={reiniciarFormulario}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              Nueva Inscripción
            </Button>
          </div>
        </Card>
      )}
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default InscripcionPage;
