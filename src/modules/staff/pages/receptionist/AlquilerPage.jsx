import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { alquilerAPI } from '../../services/alquilerAPI';
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
  ShoppingCart, 
  CreditCard, 
  User, 
  Package, 
  Plus, 
  Trash2, 
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import {
  Snackbar,
  Alert
} from '@mui/material';

const AlquilerPage = () => {
  const { isAuthenticated } = useAuth();
  const [dni, setDni] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)) // Fecha por defecto: 7 días
  });
  // Ya no necesitamos el estado de empleados
  // const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [alquilerCreado, setAlquilerCreado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [piezas, setPiezas] = useState([]);
  const [detallesAlquiler, setDetallesAlquiler] = useState([]);
  const [piezaSeleccionada, setPiezaSeleccionada] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [montoPagado, setMontoPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mostrarPago, setMostrarPago] = useState(false);
  const [totalAlquiler, setTotalAlquiler] = useState(0);
  const [botonCrearBloqueado, setBotonCrearBloqueado] = useState(false);
  const [pasoActual, setPasoActual] = useState(1); // 1: Datos básicos, 2: Detalles, 3: Pago, 4: Confirmación

  // Cargar empleados y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ya no necesitamos obtener la lista de empleados
        const clientesData = await alquilerAPI.obtenerClientes();

        console.log('Datos de clientes recibidos:', clientesData);

        // Procesar clientes
        const clientesFormateados = clientesData
          .filter(cliente => cliente && cliente.estado && cliente.id)
          .map(cliente => ({
            id: `cli-${cliente.id}`,
            clienteId: cliente.id,
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            nombreCompleto: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim(),
            dni: cliente.dni || ''
          }));

        console.log('Clientes formateados:', clientesFormateados);
        setClientes(clientesFormateados);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setFormErrors({ fetch: 'Error al cargar los datos: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleInputChange = (field, value) => {
    console.log(`Cambiando ${field} a:`, value);
    
    // Si el valor es null o undefined, usar cadena vacía
    const safeValue = value || '';
    
    // Validar el formato del ID
    if (field === 'clienteId' && !safeValue.startsWith('cli-')) {
      const formattedValue = `cli-${safeValue}`;
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else if (field === 'fechaFin') {
      setFormData(prev => ({
        ...prev,
        fechaFin: value // Fecha completa para el DatePicker
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: safeValue
      }));
    }

    // Limpiar error del campo cuando cambia
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Limpiar mensaje de éxito si existe
    if (success) {
      setSuccess(false);
    }

    console.log('Estado actualizado:', formData);
  };

  const validateForm = () => {
    const errors = {};
    if (!clienteEncontrado) {
      errors.cliente = 'Debe buscar y seleccionar un cliente por DNI';
    }
    if (!formData.clienteId) {
      errors.clienteId = 'Debe seleccionar un cliente';
    }
    if (!formData.fechaFin) {
      errors.fechaFin = 'Debe seleccionar una fecha de fin del alquiler';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setFormErrors({});
      
      // Formatear la fecha para usarla posteriormente (YYYY-MM-DD)
      const formattedFechaFin = formData.fechaFin instanceof Date 
        ? formData.fechaFin.toISOString().split('T')[0]
        : formData.fechaFin;

      // Preparar datos del alquiler temporales
      const clienteId = parseInt(formData.clienteId.replace('cli-', ''));
      
      // Validar que los IDs sean números válidos
      if (isNaN(clienteId)) {
        throw new Error('ID de cliente inválido');
      }
      
      // Estructura temporal del alquiler (sin enviar a backend todavía)
      const alquilerTemp = {
        idAlquiler: Date.now(), // ID temporal para identificar el alquiler
        clienteId: clienteId,
        fechaFin: formattedFechaFin
      };
      
      console.log('Datos de alquiler preparados (no guardados aún):', alquilerTemp);
      
      // Guardar temporalmente el alquiler creado en el estado
      setAlquilerCreado(alquilerTemp);
      
      // Solo avanzamos al siguiente paso, sin guardar todavía en el backend
      setSuccess(true);
      setMostrarDetalles(true);
      setBotonCrearBloqueado(true); 
      setPasoActual(2); // Avanzar a la selección de detalles/piezas
      
      // Cargar piezas para el siguiente paso
      await cargarPiezas();
      
      showNotification('Datos registrados. Continúe agregando los elementos del alquiler', 'success');
    } catch (err) {
      console.error('Error en la validación de datos:', err);
      setFormErrors({ submit: `Error: ${err.message}` });
      showNotification(`Error: ${err.message}`, 'error');
    }
  };

  // Función para cargar piezas disponibles
  const cargarPiezas = async () => {
    try {
      setLoading(true);
      const piezasData = await alquilerAPI.listarPiezas();
      console.log('Piezas disponibles:', piezasData);
      
      // Verificar que piezasData es un array
      if (!Array.isArray(piezasData)) {
        console.error('Error: piezasData no es un array', piezasData);
        throw new Error('La respuesta de piezas no es un array');
      }
      
      // Filtrar piezas con stock disponible
      const piezasDisponibles = piezasData
        .filter(pieza => pieza && typeof pieza === 'object' && pieza.estado && pieza.stock > 0)
        .map(pieza => ({
          id: pieza.idPieza,
          nombre: pieza.nombre,
          precioAlquiler: pieza.precioAlquiler,
          stock: pieza.stock
        }));
      
      console.log('Piezas filtradas y formateadas:', piezasDisponibles);
      setPiezas(piezasDisponibles);
    } catch (error) {
      console.error('Error al cargar piezas:', error);
      setFormErrors(prev => ({ ...prev, piezas: 'Error al cargar las piezas: ' + error.message }));
      
      // En caso de error, establecer un array vacío para evitar errores en la interfaz
      setPiezas([]);
      
      // Mostrar snackbar de error
      setSnackbarMessage('Error al cargar las piezas disponibles. Por favor, intenta de nuevo.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Cargar piezas cuando se muestre el panel de detalles
  useEffect(() => {
    if (mostrarDetalles) {
      cargarPiezas();
    }
  }, [mostrarDetalles]);

  // Función para agregar detalle
  const agregarDetalle = () => {
    console.log('Intentando agregar detalle. Pieza seleccionada:', piezaSeleccionada);

    if (!piezaSeleccionada) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Seleccione una pieza'
      }));
      return;
    }

    // Buscar la pieza seleccionada
    const pieza = piezas.find(p => p.id.toString() === piezaSeleccionada.toString());
    console.log('Pieza encontrada:', pieza);

    if (!pieza) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Pieza no encontrada'
      }));
      return;
    }

    // Verificar stock disponible
    if (cantidad > pieza.stock) {
      setFormErrors(prev => ({
        ...prev,
        detalles: `Stock insuficiente. Solo hay ${pieza.stock} disponibles.`
      }));
      return;
    }

    // Verificar si la pieza ya está en los detalles
    const detalleExistente = detallesAlquiler.find(d => d.piezaId === parseInt(piezaSeleccionada));
    
    if (detalleExistente) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Esta pieza ya ha sido agregada. Puede modificar la cantidad.'
      }));
    } else {
      // Crear nuevo detalle
      const nuevoDetalle = {
        piezaId: parseInt(piezaSeleccionada),
        cantidad: parseInt(cantidad),
        pieza: {
          id: pieza.id,
          nombre: pieza.nombre,
          precioAlquiler: pieza.precioAlquiler
        }
      };

      console.log('Nuevo detalle a agregar:', nuevoDetalle);
      setDetallesAlquiler(prev => [...prev, nuevoDetalle]);
    }

    setPiezaSeleccionada('');
    setCantidad(1);
    setFormErrors(prev => ({ ...prev, detalles: '' }));
  };

  // Eliminar un detalle del alquiler
  const eliminarDetalle = (piezaId) => {
    try {
      setDetallesAlquiler(prev => prev.filter(d => d.piezaId !== piezaId));
      showNotification('Pieza eliminada del detalle', 'success');
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      showNotification('Error al eliminar la pieza', 'error');
    }
  };

  // Actualizar cantidad de un detalle
  const actualizarCantidad = (piezaId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;
    setDetallesAlquiler(detallesAlquiler.map(d => 
      d.piezaId === piezaId ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  // Preparar para avanzar al paso de pago
  const guardarDetalles = () => {
    if (detallesAlquiler.length === 0) {
      showNotification('Error: No hay elementos seleccionados para el alquiler', 'error');
      return;
    }

    try {
      // Calcular el total del alquiler
      const total = detallesAlquiler.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.pieza.precioAlquiler);
      }, 0);
      
      setTotalAlquiler(total);
      setMostrarPago(true);
      setPasoActual(3); // Avanzar al paso de pago
      
      showNotification('Elementos agregados. Continúe con el registro del pago', 'success');
    } catch (error) {
      console.error('Error al procesar los detalles:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  };

  // Finalizar todo el proceso de alquiler (guardar todo a la vez)
  const registrarPago = async () => {
    if (!montoPagado || parseFloat(montoPagado) <= 0) {
      showNotification('Debe ingresar un monto válido', 'error');
      return;
    }

    if (parseFloat(montoPagado) < totalAlquiler) {
      showNotification('El monto pagado es menor que el total del alquiler', 'error');
      return;
    }

    setLoading(true);

    try {
      // Formatear la fecha para enviarla al backend (YYYY-MM-DD)
      const formattedFechaFin = formData.fechaFin instanceof Date 
        ? formData.fechaFin.toISOString().split('T')[0]
        : formData.fechaFin;

      // Formatear los detalles en el formato esperado por el backend
      const detallesFormateados = detallesAlquiler.map(detalle => ({
        piezaId: detalle.piezaId,
        cantidad: detalle.cantidad
      }));
      
      // Preparar la estructura completa del alquiler para enviarla en una sola llamada
      const alquilerCompleto = {
        clienteId: parseInt(formData.clienteId.replace('cli-', '')),
        fechaFin: formattedFechaFin,
        detalles: detallesFormateados,
        montoPagado: parseFloat(montoPagado),
        metodoPago: metodoPago
      };
      
      console.log('Enviando alquiler completo al backend:', alquilerCompleto);
      
      // Llamar al nuevo endpoint que procesa todo en una sola transacción
      const response = await alquilerAPI.crearAlquilerCompleto(alquilerCompleto);
      
      console.log('Alquiler completado:', response);
      setAlquilerCreado(response); // Guardamos la respuesta que incluye el ID y todos los detalles
      setPasoActual(4); // Avanzar al paso de confirmación
      
      showNotification('Alquiler registrado exitosamente', 'success');
      
      // Mostrar detalle del vuelto
      const vuelto = parseFloat(montoPagado) - totalAlquiler;
      if (vuelto > 0) {
        showNotification(`Vuelto: S/ ${vuelto.toFixed(2)}`, 'info');
      }
      
      // Mostrar un mensaje de éxito temporal
      showNotification('Alquiler completado con éxito. Preparando formulario para nuevo alquiler...', 'success');

      // Resetear el formulario para un nuevo alquiler después de 3 segundos
      setTimeout(() => {
        // Desbloquear el botón "Crear alquiler y continuar"
        setBotonCrearBloqueado(false);
        
        // Resetear todos los estados para un nuevo alquiler
        setDetallesAlquiler([]);
        setMostrarDetalles(false);
        setMostrarPago(false);
        setAlquilerCreado(null);
        setSuccess(false);
        setPiezaSeleccionada('');
        setCantidad(1);
        setFormData({
          clienteId: '',
          fechaFin: new Date(new Date().setDate(new Date().getDate() + 7))
        });
        setDni('');
        setClienteEncontrado(null);
        setTotalAlquiler(0);
        setMontoPagado('');
        setFormErrors({});
        setPasoActual(1);
        
        // Notificar que el formulario está listo para un nuevo alquiler
        showNotification('Listo para registrar un nuevo alquiler', 'info');
      }, 2000);
      
    } catch (error) {
      console.error('Error al registrar pago:', error);
      showNotification(`Error al registrar pago: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar cliente por DNI
  const buscarClientePorDNI = () => {
    if (!dni || dni.trim() === '') {
      setFormErrors(prev => ({
        ...prev,
        dni: 'Ingrese un DNI válido'
      }));
      return;
    }
    
    // Buscar cliente
    const clienteEncontrado = clientes.find(c => c.dni === dni);
    if (clienteEncontrado) {
      console.log('Cliente encontrado:', clienteEncontrado);
      setClienteEncontrado(clienteEncontrado);
      setFormData(prev => ({
        ...prev,
        clienteId: clienteEncontrado.id
      }));
      setFormErrors(prev => ({
        ...prev,
        dni: null,
        cliente: null
      }));
    } else {
      setClienteEncontrado(null);
      setFormErrors(prev => ({
        ...prev,
        dni: 'No se encontró ningún cliente con ese DNI'
      }));
    }
  };

  const showNotification = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Función para reiniciar completamente el formulario
  const reiniciarFormulario = () => {
    // Mostrar confirmación antes de reiniciar
    if (botonCrearBloqueado && (!mostrarPago || confirm('¿Está seguro que desea cancelar este alquiler y empezar uno nuevo?'))) {
      // Desbloquear el botón "Crear alquiler y continuar"
      setBotonCrearBloqueado(false);
      
      // Resetear todos los estados para un nuevo alquiler
      setDetallesAlquiler([]);
      setMostrarDetalles(false);
      setMostrarPago(false);
      setAlquilerCreado(null);
      setSuccess(false);
      setPiezaSeleccionada('');
      setCantidad(1);
      setFormData({

        clienteId: '',
        fechaFin: new Date(new Date().setDate(new Date().getDate() + 7))
      });
      setDni('');
      setClienteEncontrado(null);
      setTotalAlquiler(0);
      setMontoPagado('');
      setFormErrors({});
      setPasoActual(1); // Volver al primer paso
      
      showNotification('Formulario reiniciado correctamente', 'info');
    }
  };

  // Componente para mostrar el paso actual en el proceso
  const ProgresoAlquiler = ({ pasoActual }) => {
    const pasos = [
      { numero: 1, nombre: 'Datos cliente' },
      { numero: 2, nombre: 'Elementos' },
      { numero: 3, nombre: 'Pago' },
      { numero: 4, nombre: 'Confirmación' }
    ];

    return (
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between">
          {pasos.map(paso => (
            <div 
              key={paso.numero} 
              className={`flex flex-col items-center ${paso.numero <= pasoActual ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  paso.numero === pasoActual ? 'border-blue-600 bg-blue-50 font-bold' : 
                  paso.numero < pasoActual ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                }`}
              >
                {paso.numero < pasoActual ? (
                  <CheckCircle size={18} />
                ) : (
                  paso.numero
                )}
              </div>
              <div className="mt-2 text-sm font-medium">{paso.nombre}</div>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <div className="absolute top-0 h-2 bg-gray-200 w-full rounded-full"></div>
          <div 
            className="absolute top-0 h-2 bg-blue-500 rounded-full transition-all duration-500" 
            style={{ width: `${((pasoActual - 1) / (pasos.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title>Registro de Alquiler</Title>
        {botonCrearBloqueado && (
          <Button 
            onClick={reiniciarFormulario} 
            variant="secondary"
            color="gray"
            size="sm"
          >
            Nuevo Alquiler
          </Button>
        )}
      </div>
      
      <ProgresoAlquiler pasoActual={pasoActual} />
      
      {formErrors.fetch && (
        <Alert severity="error" className="mb-4">
          {formErrors.fetch}
        </Alert>
      )}
      
      {/* Formulario para crear alquiler */}
      <Card className="mb-6 shadow-sm">
        <Title className="mb-4 flex items-center">
          <User size={20} className="mr-2 text-blue-600" />
          <span>Datos del alquiler</span>
        </Title>
        
        {botonCrearBloqueado && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Text className="text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Hay un alquiler en proceso. Para registrar uno nuevo, haga clic en "Nuevo Alquiler" o termine el proceso actual.
            </Text>
          </div>
        )}
        
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
              disabled={botonCrearBloqueado}
            />
            <Button 
              onClick={buscarClientePorDNI} 
              disabled={loading || botonCrearBloqueado}
              icon={Search}
              color="blue"
            >
              Buscar
            </Button>
          </div>
        </div>
        
        {clienteEncontrado && (
          <div className="mb-4 p-2 border border-green-200 bg-green-50 rounded">
            <Text>
              <CheckCircle className="inline-block mr-2 text-green-600" size={16} /> 
              Cliente encontrado: <strong>{clienteEncontrado.nombreCompleto}</strong> (DNI: {clienteEncontrado.dni})
            </Text>
          </div>
        )}
        
        {formErrors.cliente && !clienteEncontrado && (
          <div className="mb-4 p-2 border border-red-200 bg-red-50 rounded">
            <Text className="text-red-600">
              <AlertCircle className="inline-block mr-2" size={16} /> 
              {formErrors.cliente}
            </Text>
          </div>
        )}
        
        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Text className="mb-2 font-medium">Fecha de fin del alquiler</Text>
            <DatePicker
              value={formData.fechaFin}
              onValueChange={(value) => handleInputChange('fechaFin', value)}
              enableClear={false}
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
              icon={Calendar}
              disabled={botonCrearBloqueado}
              className="bg-white"
            />
          </div>
        </div>
        
        {formErrors.submit && (
          <div className="mb-4 p-2 border border-red-200 bg-red-50 rounded">
            <Text className="text-red-600">
              {formErrors.submit}
            </Text>
          </div>
        )}
        
        <Button 
          onClick={handleSubmit}
          disabled={loading || !clienteEncontrado || botonCrearBloqueado}
          loading={loading}
          loadingText="Procesando..."
          className="w-full mt-4"
          icon={ShoppingCart}
          size="lg"
          color="blue"
        >
          Crear alquiler y continuar
        </Button>
      </Card>

      {/* Sección de detalles del alquiler - aparece cuando mostrarDetalles es true */}
      {mostrarDetalles && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-2 flex items-center">
            <Package size={20} className="mr-2 text-blue-600" />
            <span>Agregar piezas al alquiler</span>
          </Title>
          {alquilerCreado && (
            <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <Text className="flex items-center text-gray-700">
                <ShoppingCart size={16} className="mr-2" />
                {alquilerCreado.idAlquiler ? 
                  `Alquiler #${alquilerCreado.idAlquiler} - ${new Date().toLocaleDateString()}` : 
                  `Nuevo alquiler - ${new Date().toLocaleDateString()}`}
              </Text>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Text className="mb-2 font-medium">Seleccionar pieza</Text>
              <SearchSelect
                value={piezaSeleccionada}
                onValueChange={setPiezaSeleccionada}
                disabled={loading || mostrarPago}
                placeholder="Seleccione una pieza"
                icon={Package}
                className="bg-white"
              >
                {piezas.map(pieza => (
                  <SearchSelectItem 
                    key={pieza.id} 
                    value={pieza.id.toString()}
                    icon={Package}
                  >
                    {pieza.nombre} - S/ {pieza.precioAlquiler} (Stock: {pieza.stock})
                  </SearchSelectItem>
                ))}
              </SearchSelect>
            </div>
            <div>
              <Text className="mb-2 font-medium">Cantidad</Text>
              <NumberInput
                value={cantidad}
                onValueChange={setCantidad}
                min={1}
                enableStepper
                disabled={loading || mostrarPago}
                className="bg-white"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={agregarDetalle} 
                disabled={loading || !piezaSeleccionada || mostrarPago}
                icon={Plus}
                className="w-full"
                color="blue"
              >
                Agregar pieza
              </Button>
            </div>
          </div>
          
          {formErrors.detalles && (
            <div className="mb-4 p-2 border border-red-200 bg-red-50 rounded">
              <Text className="text-red-600">
                <AlertCircle className="inline-block mr-2" size={16} /> 
                {formErrors.detalles}
              </Text>
            </div>
          )}
          
          {detallesAlquiler.length > 0 ? (
            <>
              <Title className="text-lg mb-2">Piezas seleccionadas</Title>
              <Table className="mb-4">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Pieza</TableHeaderCell>
                    <TableHeaderCell>Precio</TableHeaderCell>
                    <TableHeaderCell>Cantidad</TableHeaderCell>
                    <TableHeaderCell>Subtotal</TableHeaderCell>
                    <TableHeaderCell>Opciones</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detallesAlquiler.map((detalle) => {
                    const subtotal = detalle.cantidad * detalle.pieza.precioAlquiler;
                    return (
                      <TableRow key={detalle.piezaId}>
                        <TableCell>{detalle.pieza.nombre}</TableCell>
                        <TableCell>S/ {detalle.pieza.precioAlquiler}</TableCell>
                        <TableCell>
                          {!mostrarPago ? (
                            <NumberInput
                              value={detalle.cantidad}
                              onValueChange={(value) => actualizarCantidad(detalle.piezaId, value)}
                              min={1}
                              enableStepper
                              disabled={loading}
                              className="w-20"
                            />
                          ) : (
                            detalle.cantidad
                          )}
                        </TableCell>
                        <TableCell>S/ {subtotal.toFixed(2)}</TableCell>
                        <TableCell>
                          {!mostrarPago && (
                            <Button 
                              onClick={() => eliminarDetalle(detalle.piezaId)}
                              size="xs"
                              variant="light"
                              color="red"
                              icon={Trash2}
                              disabled={loading}
                            >
                              Eliminar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                <Text className="text-lg font-semibold text-blue-800">
                  Total: S/ {detallesAlquiler.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.pieza.precioAlquiler), 0).toFixed(2)}
                </Text>
                {!mostrarPago && (
                  <Button 
                    onClick={guardarDetalles} 
                    disabled={loading || detallesAlquiler.length === 0}
                    loading={loading}
                    icon={CreditCard}
                    color="blue"
                    size="lg"
                  >
                    Guardar y continuar al pago
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 text-center border border-gray-200 rounded">
              <Text>No hay piezas agregadas al alquiler</Text>
            </div>
          )}
        </Card>
      )}
      
      {/* Panel de registro de pago */}
      {mostrarPago && (
        <Card className="mb-6 shadow-sm">
          <Title className="mb-4 flex items-center">
            <CreditCard size={20} className="mr-2 text-blue-600" />
            <span>Registrar pago</span>
          </Title>
          
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
                min={totalAlquiler}
                placeholder={`Mínimo: S/ ${totalAlquiler.toFixed(2)}`}
                className="bg-white"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div>
              <Text className="text-lg font-semibold text-blue-800">
                Total a pagar: S/ {totalAlquiler.toFixed(2)}
              </Text>
              {montoPagado && parseFloat(montoPagado) > totalAlquiler && (
                <Text className="text-green-600 font-medium">
                  Vuelto: S/ {(parseFloat(montoPagado) - totalAlquiler).toFixed(2)}
                </Text>
              )}
            </div>
            <Button 
              onClick={registrarPago} 
              disabled={loading || !montoPagado || parseFloat(montoPagado) < totalAlquiler}
              loading={loading}
              icon={CheckCircle}
              color="blue"
              size="lg"
            >
              Finalizar alquiler
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

export default AlquilerPage;
