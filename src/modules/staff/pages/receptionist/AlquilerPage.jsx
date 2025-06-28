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
    empleadoId: '',
    clienteId: '',
    fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)) // Fecha por defecto: 7 días
  });
  const [empleados, setEmpleados] = useState([]);
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

  // Cargar empleados y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empleadosData, clientesData] = await Promise.all([
          alquilerAPI.obtenerEmpleados(),
          alquilerAPI.obtenerClientes()
        ]);

        console.log('Datos de empleados recibidos:', empleadosData);
        console.log('Datos de clientes recibidos:', clientesData);

        // Procesar empleados
        const recepcionistas = empleadosData
          .filter(emp => emp && emp.estado && emp.idEmpleado)
          .map(emp => ({
            id: `emp-${emp.idEmpleado}`,
            idEmpleado: emp.idEmpleado,
            nombre: emp.nombre || '',
            apellidos: emp.apellidos || '',
            nombreCompleto: `${emp.nombre || ''} ${emp.apellidos || ''}`.trim()
          }));

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

        console.log('Recepcionistas formateados:', recepcionistas);
        console.log('Clientes formateados:', clientesFormateados);

        setEmpleados(recepcionistas);
        // Asignar el primer empleado por defecto
        if (recepcionistas.length > 0) {
          setFormData(prev => ({
            ...prev,
            empleadoId: recepcionistas[0].id
          }));
        }
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
    if (field === 'empleadoId' && !safeValue.startsWith('emp-')) {
      const formattedValue = `emp-${safeValue}`;
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else if (field === 'clienteId' && !safeValue.startsWith('cli-')) {
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
      setLoading(true);
      setFormErrors({});
      
      // Formatear la fecha para enviarla al backend (YYYY-MM-DD)
      const formattedFechaFin = formData.fechaFin instanceof Date 
        ? formData.fechaFin.toISOString().split('T')[0]
        : formData.fechaFin;

      // Preparar datos del alquiler
      const alquilerData = {
        cliente: {
          idCliente: parseInt(formData.clienteId.replace('cli-', ''))
        },
        empleado: {
          idEmpleado: parseInt(formData.empleadoId.replace('emp-', ''))
        },
        fechaFin: formattedFechaFin
      };
      
      // Validar que los IDs sean números válidos
      if (isNaN(alquilerData.cliente.idCliente) || isNaN(alquilerData.empleado.idEmpleado)) {
        throw new Error('IDs de cliente o empleado inválidos');
      }
      
      console.log('Enviando datos de alquiler:', alquilerData);
      
      const response = await alquilerAPI.guardarAlquiler(alquilerData);
      console.log('Respuesta completa al crear alquiler:', response);
      
      if (!response || typeof response !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }
      
      if (!response.idAlquiler) {
        console.error('Respuesta sin ID de alquiler:', response);
        throw new Error('No se recibió un ID de alquiler válido del servidor');
      }
      
      // Guardar el alquiler en el estado
      const alquilerCreado = {
        ...response,
        idAlquiler: response.idAlquiler
      };
      
      console.log('Alquiler guardado en estado:', alquilerCreado);
      setAlquilerCreado(alquilerCreado);
      setSuccess(true);
      setMostrarDetalles(true);
      showNotification('Alquiler creado exitosamente', 'success');
    } catch (err) {
      console.error('Error detallado al crear alquiler:', err);
      setFormErrors({ submit: `Error al crear el alquiler: ${err.message}` });
      showNotification(`Error al crear el alquiler: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar piezas cuando se muestre el panel de detalles
  useEffect(() => {
    const cargarPiezas = async () => {
      if (mostrarDetalles) {
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
      }
    };

    cargarPiezas();
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

  // Guardar todos los detalles del alquiler
  const guardarDetalles = async () => {
    if (!alquilerCreado || !alquilerCreado.idAlquiler) {
      showNotification('Error: No se encontró el ID del alquiler', 'error');
      return;
    }

    if (detallesAlquiler.length === 0) {
      showNotification('Error: No hay detalles para guardar', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Guardando detalles para alquiler ID:', alquilerCreado.idAlquiler);
      
      // Formatear los detalles en el formato esperado por el backend
      const detallesFormateados = detallesAlquiler.map(detalle => ({
        piezaId: detalle.piezaId,
        cantidad: detalle.cantidad
      }));

      console.log('Detalles formateados para enviar:', detallesFormateados);
      
      const response = await alquilerAPI.agregarDetallesAlquiler(
        alquilerCreado.idAlquiler,
        detallesFormateados
      );
      
      console.log('Respuesta del servidor al guardar detalles:', response);
      
      // Calcular el total del alquiler
      const total = detallesAlquiler.reduce((sum, detalle) => {
        return sum + (detalle.cantidad * detalle.pieza.precioAlquiler);
      }, 0);
      
      setTotalAlquiler(total);
      setMostrarPago(true);
      showNotification('Detalles guardados correctamente', 'success');
      
    } catch (error) {
      console.error('Error al guardar detalles:', error);
      showNotification(`Error al guardar detalles: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Registrar el pago del alquiler
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
      const response = await alquilerAPI.registrarPago(
        alquilerCreado.idAlquiler,
        parseFloat(montoPagado),
        metodoPago
      );
      
      console.log('Pago registrado:', response);
      showNotification('Pago registrado exitosamente', 'success');
      
      // Mostrar detalle del vuelto
      const vuelto = parseFloat(montoPagado) - totalAlquiler;
      if (vuelto > 0) {
        showNotification(`Vuelto: S/ ${vuelto.toFixed(2)}`, 'info');
      }
      
      // Resetear el formulario para un nuevo alquiler
      setTimeout(() => {
        setDetallesAlquiler([]);
        setMostrarDetalles(false);
        setMostrarPago(false);
        setAlquilerCreado(null);
        setSuccess(false);
        setFormData({
          empleadoId: empleados.length > 0 ? empleados[0].id : '',
          clienteId: '',
          fechaFin: new Date(new Date().setDate(new Date().getDate() + 7))
        });
        setDni('');
        setClienteEncontrado(null);
        setTotalAlquiler(0);
        setMontoPagado('');
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

  return (
    <div className="p-4">
      <Title className="mb-4">
        {mostrarDetalles ? 'Agregar piezas al alquiler' : 'Registrar nuevo alquiler'}
      </Title>
      
      {formErrors.fetch && (
        <Alert severity="error" className="mb-4">
          {formErrors.fetch}
        </Alert>
      )}
      
      {/* Formulario para crear alquiler */}
      {!mostrarDetalles ? (
        <Card className="mb-4">
          <Title className="mb-4">Datos del alquiler</Title>
          
          <div className="mb-4">
            <Text className="mb-2">Buscar cliente por DNI</Text>
            <div className="flex gap-2">
              <TextInput
                placeholder="Ingrese DNI del cliente"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                error={!!formErrors.dni}
                errorMessage={formErrors.dni}
                icon={User}
                className="flex-1"
              />
              <Button 
                onClick={buscarClientePorDNI} 
                disabled={loading}
                icon={Search}
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
          
          <div className="mb-4">
            <Text className="mb-2">Seleccionar empleado</Text>
            <SearchSelect 
              value={formData.empleadoId}
              onValueChange={(value) => handleInputChange('empleadoId', value)}
              disabled={loading}
              placeholder="Seleccione un empleado"
              icon={User}
              error={!!formErrors.empleadoId}
              errorMessage={formErrors.empleadoId}
            >
              {empleados.map(empleado => (
                <SearchSelectItem 
                  key={empleado.id} 
                  value={empleado.id}
                  icon={User}
                >
                  {empleado.nombreCompleto}
                </SearchSelectItem>
              ))}
            </SearchSelect>
          </div>
          
          <div className="mb-6">
            <Text className="mb-2">Fecha de fin del alquiler</Text>
            <DatePicker
              value={formData.fechaFin}
              onValueChange={(value) => handleInputChange('fechaFin', value)}
              enableClear={false}
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
              icon={Calendar}
            />
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
            disabled={loading || !clienteEncontrado}
            loading={loading}
            loadingText="Procesando..."
            className="w-full"
          >
            Crear alquiler y continuar
          </Button>
        </Card>
      ) : (
        <>
          {/* Panel de detalles del alquiler */}
          <div className="mb-4">
            <Button 
              onClick={() => setMostrarDetalles(false)} 
              size="xs"
              variant="secondary"
              icon={ArrowLeft}
            >
              Volver
            </Button>
          </div>
          
          <Card className="mb-4">
            <Title className="mb-2">Agregar piezas al alquiler</Title>
            <Text className="mb-4">Alquiler #{alquilerCreado?.idAlquiler} - {new Date().toLocaleDateString()}</Text>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Text className="mb-1">Seleccionar pieza</Text>
                <SearchSelect
                  value={piezaSeleccionada}
                  onValueChange={setPiezaSeleccionada}
                  disabled={loading || mostrarPago}
                  placeholder="Seleccione una pieza"
                  icon={Package}
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
                <Text className="mb-1">Cantidad</Text>
                <NumberInput
                  value={cantidad}
                  onValueChange={setCantidad}
                  min={1}
                  enableStepper
                  disabled={loading || mostrarPago}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={agregarDetalle} 
                  disabled={loading || !piezaSeleccionada || mostrarPago}
                  icon={Plus}
                  className="w-full"
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
                
                <div className="flex justify-between items-center mb-4">
                  <Text className="text-lg font-semibold">
                    Total: S/ {detallesAlquiler.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.pieza.precioAlquiler), 0).toFixed(2)}
                  </Text>
                  {!mostrarPago && (
                    <Button 
                      onClick={guardarDetalles} 
                      disabled={loading || detallesAlquiler.length === 0}
                      loading={loading}
                      icon={CheckCircle}
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
          
          {/* Panel de registro de pago */}
          {mostrarPago && (
            <Card>
              <Title className="mb-4">Registrar pago</Title>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Text className="mb-1">Método de pago</Text>
                  <SearchSelect
                    value={metodoPago}
                    onValueChange={setMetodoPago}
                    disabled={loading}
                    icon={CreditCard}
                  >
                    <SearchSelectItem value="EFECTIVO">Efectivo</SearchSelectItem>
                    <SearchSelectItem value="TARJETA">Tarjeta</SearchSelectItem>
                    <SearchSelectItem value="YAPE">Yape</SearchSelectItem>
                    <SearchSelectItem value="PLIN">Plin</SearchSelectItem>
                  </SearchSelect>
                </div>
                <div>
                  <Text className="mb-1">Monto recibido (S/)</Text>
                  <TextInput
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    disabled={loading}
                    type="number"
                    step="0.01"
                    min={totalAlquiler}
                    placeholder={`Mínimo: S/ ${totalAlquiler.toFixed(2)}`}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Text className="text-lg font-semibold">
                    Total a pagar: S/ {totalAlquiler.toFixed(2)}
                  </Text>
                  {montoPagado && parseFloat(montoPagado) > totalAlquiler && (
                    <Text>
                      Vuelto: S/ {(parseFloat(montoPagado) - totalAlquiler).toFixed(2)}
                    </Text>
                  )}
                </div>
                <Button 
                  onClick={registrarPago} 
                  disabled={loading || !montoPagado || parseFloat(montoPagado) < totalAlquiler}
                  loading={loading}
                  icon={CheckCircle}
                >
                  Finalizar alquiler
                </Button>
              </div>
            </Card>
          )}
        </>
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
