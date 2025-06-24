import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { ventasAPI } from '../../services/ventaAPI';
import { productosAPI } from '../../services/productosAPI';
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
  NumberInput
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
  Loader2 
} from 'lucide-react';
import {
  Snackbar,
  Alert
} from '@mui/material';

const VentaPage = () => {
  const { isAuthenticated } = useAuth();
  const [dni, setDni] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [formData, setFormData] = useState({
    empleadoId: '',
    clienteId: ''
  });
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [ventaCreada, setVentaCreada] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [productos, setProductos] = useState([]);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [montoPagado, setMontoPagado] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mostrarPago, setMostrarPago] = useState(false);
  const [totalVenta, setTotalVenta] = useState(0);

  // Cargar empleados y clientes al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empleadosData, clientesData] = await Promise.all([
          ventasAPI.obtenerEmpleados(),
          ventasAPI.obtenerClientes()
        ]);

        console.log('Datos de empleados recibidos:', empleadosData);
        console.log('Datos de clientes recibidos:', clientesData);        // Procesar empleados
        const recepcionistas = empleadosData          .filter(emp => emp && emp.estado && emp.idEmpleado)
          .map(emp => ({
            id: `emp-${emp.idEmpleado}`,
            idEmpleado: emp.idEmpleado,
            nombre: emp.nombre || '',
            apellidos: emp.apellidos || '',
            nombreCompleto: `${emp.nombre || ''} ${emp.apellidos || ''}`.trim()
          }));        // Procesar clientes
        const clientesFormateados = clientesData
          .filter(cliente => cliente && cliente.estado && cliente.id)
          .map(cliente => ({
            id: `cli-${cliente.id}`,
            clienteId: cliente.id,
            nombre: cliente.nombre || '',
            apellidos: cliente.apellidos || '',
            nombreCompleto: `${cliente.nombre || ''} ${cliente.apellidos || ''}`.trim(),
            dni: cliente.dni || ''
          }));console.log('Recepcionistas formateados:', recepcionistas);
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
  }, [isAuthenticated]);  const handleInputChange = (field, value) => {
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
  };  const validateForm = () => {
    const errors = {};
    if (!clienteEncontrado) {
      errors.cliente = 'Debe buscar y seleccionar un cliente por DNI';
    }
    if (!formData.clienteId) {
      errors.clienteId = 'Debe seleccionar un cliente';
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
        // Preparar datos de la venta
      const ventaData = {
        cliente: {
          idCliente: parseInt(formData.clienteId.replace('cli-', ''))
        },
        empleado: {
          idEmpleado: parseInt(formData.empleadoId.replace('emp-', ''))
        }
      };
      
      // Validar que los IDs sean números válidos
      if (isNaN(ventaData.cliente.idCliente) || isNaN(ventaData.empleado.idEmpleado)) {
        throw new Error('IDs de cliente o empleado inválidos');
      }
      
      console.log('Enviando datos de venta:', ventaData);
      
      const response = await ventasAPI.guardarVenta(ventaData);
      console.log('Respuesta completa al crear venta:', response);
      
      if (!response || typeof response !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }
      
      if (!response.idVenta) {
        console.error('Respuesta sin ID de venta:', response);
        throw new Error('No se recibió un ID de venta válido del servidor');
      }
      
      // Guardar la venta en el estado
      const ventaCreada = {
        ...response,
        idVenta: response.idVenta
      };
      
      console.log('Venta guardada en estado:', ventaCreada);
      setVentaCreada(ventaCreada);
      setSuccess(true);
      setMostrarDetalles(true);
      showNotification('Venta creada exitosamente', 'success');
    } catch (err) {
      console.error('Error detallado al crear venta:', err);
      setFormErrors({ submit: `Error al crear la venta: ${err.message}` });
      showNotification(`Error al crear la venta: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos cuando se muestre el panel de detalles
  useEffect(() => {
    const cargarProductos = async () => {
      if (mostrarDetalles) {
        try {
          setLoading(true);
          const response = await productosAPI.listarProductos();
          console.log('Productos recibidos de la API:', response);

          // Asegurarse de que los productos tengan el formato correcto
          const productosFormateados = response
            .filter(p => p && p.idProducto && p.estado) // Solo productos activos
            .map(p => {
              const producto = {
                id: p.idProducto,
                nombre: p.nombre || 'Sin nombre',
                precio: p.precioVenta ? parseFloat(p.precioVenta) : 0,
                stockTotal: p.stockTotal || 0,
                categoria: p.categoria?.nombre || 'Sin categoría'
              };
              console.log('Producto formateado:', producto);
              return producto;
            });

          console.log('Lista final de productos formateados:', productosFormateados);
          setProductos(productosFormateados);
        } catch (error) {
          console.error('Error al cargar productos:', error);
          setFormErrors(prev => ({ ...prev, productos: 'Error al cargar los productos' }));
        } finally {
          setLoading(false);
        }
      }
    };

    cargarProductos();
  }, [mostrarDetalles]);
  // Función para agregar detalle
  const agregarDetalle = () => {
    console.log('Intentando agregar detalle. Producto seleccionado:', productoSeleccionado);

    if (!productoSeleccionado) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Seleccione un producto'
      }));
      return;
    }

    // Buscar el producto seleccionado
    const producto = productos.find(p => p.id.toString() === productoSeleccionado.toString());
    console.log('Producto encontrado:', producto);

    if (!producto) {
      setFormErrors(prev => ({
        ...prev,
        detalles: 'Producto no encontrado'
      }));
      return;
    }

    // Verificar stock disponible
    if (cantidad > producto.stockTotal) {
      setFormErrors(prev => ({
        ...prev,
        detalles: `Stock insuficiente. Stock disponible: ${producto.stockTotal}`
      }));
      return;
    }

    // Verificar si el producto ya está en los detalles
    const detalleExistente = detallesVenta.find(d => 
      d.productoId.toString() === productoSeleccionado.toString()
    );

    if (detalleExistente) {
      // Si el producto ya existe, verificar si la nueva cantidad total excede el stock
      const cantidadTotal = detalleExistente.cantidad + cantidad;
      if (cantidadTotal > producto.stockTotal) {
        setFormErrors(prev => ({
          ...prev,
          detalles: `La cantidad total excede el stock disponible (${producto.stockTotal})`
        }));
        return;
      }

      // Actualizar la cantidad del detalle existente
      setDetallesVenta(detallesVenta.map(d => 
        d.productoId.toString() === productoSeleccionado.toString()
          ? { ...d, cantidad: cantidadTotal }
          : d
      ));
    } else {
      // Agregar nuevo detalle
      const nuevoDetalle = {
        productoId: parseInt(productoSeleccionado),
        cantidad: parseInt(cantidad),
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          categoria: producto.categoria
        }
      };

      console.log('Nuevo detalle a agregar:', nuevoDetalle);
      setDetallesVenta(prev => [...prev, nuevoDetalle]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
    setFormErrors(prev => ({ ...prev, detalles: '' }));
  };
  // Eliminar un detalle de la venta
  const eliminarDetalle = (productoId) => {
    try {
      setDetallesVenta(prev => prev.filter(d => d.productoId !== productoId));
      showNotification('Producto eliminado del detalle', 'success');
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      showNotification('Error al eliminar el producto', 'error');
    }
  };

  // Actualizar cantidad de un detalle
  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return;
    setDetallesVenta(detallesVenta.map(d => 
      d.productoId === productoId ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };
  // Guardar todos los detalles de la venta
  const guardarDetalles = async () => {
    if (!ventaCreada || !ventaCreada.idVenta) {
      showNotification('Error: No se encontró el ID de la venta', 'error');
      return;
    }

    if (detallesVenta.length === 0) {
      showNotification('Error: No hay detalles para guardar', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log('Guardando detalles para venta ID:', ventaCreada.idVenta);
      
      // Formatear los detalles en el formato esperado por el backend
      const detallesFormateados = detallesVenta.map(detalle => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad
      }));
      
      console.log('Detalles formateados:', detallesFormateados);
      
      // Enviar los detalles
      await ventasAPI.agregarDetallesVenta(ventaCreada.idVenta, detallesFormateados);
      
      showNotification('Detalles guardados. Por favor, proceda con el pago');
      setMostrarPago(true);
      
    } catch (error) {
      console.error('Error al guardar detalles:', error);
      showNotification(
        `Error al guardar los detalles: ${error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  // Función para procesar el pago
  const procesarPago = async () => {
    if (!montoPagado || parseFloat(montoPagado) <= 0) {
      showNotification('Error: Ingrese un monto válido', 'error');
      return;
    }
    
    const totalAPagar = totalVenta;
    if (parseFloat(montoPagado) < totalAPagar) {
      showNotification('Error: El monto pagado es menor al total de la venta', 'error');
      return;
    }

    setLoading(true);

    try {
      const datoPago = {
        idVenta: ventaCreada.idVenta,
        montoPagado: parseFloat(montoPagado),
        metodoPago: metodoPago
      };
      
      console.log('Enviando datos de pago:', datoPago);
      await ventasAPI.registrarPago(
        ventaCreada.idVenta,
        parseFloat(montoPagado),
        metodoPago
      );      showNotification('Pago registrado exitosamente');
      
      // Resetear estados
      setDetallesVenta([]);
      setMostrarDetalles(false);
      setMostrarPago(false);
      setVentaCreada(null);
      setFormData(prev => ({
        ...prev,
        clienteId: ''
      }));
      setMontoPagado('');
      setMetodoPago('EFECTIVO');
      // Limpiar búsqueda por DNI
      setDni('');
      setClienteEncontrado(null);
      
      // Recargar todos los datos
      await recargarDatos();
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      showNotification(
        `Error al procesar el pago: ${error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar todos los datos
  const recargarDatos = async () => {
    try {
      setLoading(true);
      const [empleadosData, clientesData, productosData] = await Promise.all([
        ventasAPI.obtenerEmpleados(),
        ventasAPI.obtenerClientes(),
        productosAPI.listarProductos()
      ]);

      // Procesar empleados
      const recepcionistas = empleadosData
        .filter(emp => emp && emp.estado && emp.idEmpleado)
        .map(emp => ({
          id: `emp-${emp.idEmpleado}`,
          idEmpleado: emp.idEmpleado,
          nombre: emp.nombre || '',
          apellidos: emp.apellidos || '',
          nombreCompleto: `${emp.nombre || ''} ${emp.apellidos || ''}`.trim()
        }));      // Procesar clientes
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

      // Procesar productos
      const productosFormateados = productosData
        .filter(p => p && p.idProducto && p.estado)
        .map(p => ({
          id: p.idProducto,
          nombre: p.nombre || 'Sin nombre',
          precio: p.precioVenta ? parseFloat(p.precioVenta) : 0,
          stockTotal: p.stockTotal || 0,
          categoria: p.categoria?.nombre || 'Sin categoría'
        }));

      setEmpleados(recepcionistas);
      setClientes(clientesFormateados);
      setProductos(productosFormateados);

      // Asignar el primer empleado por defecto
      if (recepcionistas.length > 0) {
        setFormData(prev => ({
          ...prev,
          empleadoId: recepcionistas[0].id
        }));
      }

    } catch (error) {
      console.error('Error al recargar datos:', error);
      showNotification('Error al recargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  // Calcular total de la venta cuando cambian los detalles
  useEffect(() => {
    const total = detallesVenta.reduce((sum, detalle) => 
      sum + (detalle.cantidad * detalle.producto.precio), 0
    );
    setTotalVenta(total);
  }, [detallesVenta]);
  const buscarClientePorDNI = () => {
    if (!dni.trim()) {
      showNotification('Por favor, ingrese un DNI válido', 'error');
      return;
    }

    console.log('Buscando cliente con DNI:', dni);
    console.log('Lista de clientes:', clientes);

    // Buscar en la lista de clientes cargada
    const cliente = clientes.find(cli => cli.dni === dni);
    
    if (!cliente) {
      setClienteEncontrado(null);
      setFormData(prev => ({
        ...prev,
        clienteId: ''
      }));
      showNotification('No se encontró ningún cliente con ese DNI', 'error');
      return;
    }

    console.log('Cliente encontrado:', cliente);
    setClienteEncontrado(cliente);
    // Actualizar el formData con el ID del cliente encontrado usando el formato correcto
    setFormData(prev => ({
      ...prev,
      clienteId: `cli-${cliente.clienteId}`
    }));
    showNotification('Cliente encontrado', 'success');
  };

  const handleDNIChange = (e) => {
    const value = e.target.value;
    if (value.length <= 8 && /^\d*$/.test(value)) {
      setDni(value);
      // Limpiar cliente encontrado si se modifica el DNI
      if (clienteEncontrado) {
        setClienteEncontrado(null);
        setFormData(prev => ({
          ...prev,
          clienteId: ''
        }));
      }
    }
  };

  if (loading && !empleados.length && !clientes.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Venta</h1>
          <p className="text-gray-500">Registra una nueva venta</p>
        </div>
        {mostrarDetalles && (
          <Button
            icon={ArrowLeft}
            variant="secondary"
            onClick={() => setMostrarDetalles(false)}
          >
            Volver
          </Button>
        )}
      </div>

      {formErrors.fetch && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <Text color="red">{formErrors.fetch}</Text>
          </div>
        </div>
      )}      <Card className="mb-6">
        <div className="space-y-6">
          <Title>Información Básica</Title>
          <div className="space-y-6">
            {/* Buscador por DNI */}            <div className="border p-4 rounded-lg bg-gray-50">
              <Text className="mb-2 font-medium">Buscar Cliente por DNI</Text>
              <div className="flex gap-2">
                <TextInput
                  placeholder="Ingrese DNI del cliente"
                  value={dni}
                  onChange={handleDNIChange}
                  maxLength={8}
                  className="w-full"
                />
                <Button
                  onClick={buscarClientePorDNI}
                  disabled={!dni.trim()}
                  icon={Search}
                >
                  Buscar
                </Button>
              </div>
              
              {clienteEncontrado && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <Text className="font-semibold text-lg">{clienteEncontrado.nombreCompleto}</Text>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <Text className="text-gray-500">DNI</Text>
                          <Text className="font-medium">{clienteEncontrado.dni}</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'none' }}>
              <Text className="mb-2">Empleado</Text><SearchSelect
                  value={formData.empleadoId || ""}
                  onValueChange={(value) => handleInputChange('empleadoId', value)}
                  placeholder="Buscar empleado..."
                  disabled={loading}
                  className="w-full"
                >
                  {empleados.map((empleado) => (
                    <SearchSelectItem 
                      key={empleado.id} 
                      value={empleado.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{empleado.nombreCompleto}</span>
                      </div>
                    </SearchSelectItem>
                  ))}
                </SearchSelect>
                {formErrors.empleadoId && (
                  <Text color="red" className="mt-1 text-sm">{formErrors.empleadoId}</Text>
                )}
              </div>

              <div>
                <Text className="mb-2">Cliente</Text>                <SearchSelect
                  value={formData.clienteId || ""}
                  onValueChange={(value) => handleInputChange('clienteId', value)}
                  placeholder="Buscar cliente..."
                  disabled={loading}
                  className="w-full"
                >
                  {clientes.map((cliente) => (
                    <SearchSelectItem 
                      key={cliente.id} 
                      value={cliente.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{cliente.nombreCompleto}</span>
                      </div>
                    </SearchSelectItem>
                  ))}
                </SearchSelect>
                {formErrors.clienteId && (
                  <Text color="red" className="mt-1 text-sm">{formErrors.clienteId}</Text>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  icon={loading ? Loader2 : ShoppingCart}
                  disabled={loading}
                  variant="primary"
                  className="w-full md:w-auto"
                >
                  {loading ? 'Procesando...' : 'Crear Venta'}
                </Button>
              </div>
            </div>
          </div>
      </Card>

      {/* Mostrar panel de pago o detalles cuando corresponda */}      {mostrarPago ? (
        <Card>
          <div className="space-y-6">
            <Title>Procesar Pago</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Text className="mb-2">Método de Pago</Text>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>

              <div>
                <Text className="mb-2">Monto Recibido</Text>
                <NumberInput
                  value={montoPagado}
                  onValueChange={setMontoPagado}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  enableStepper={false}
                />
              </div>
            </div>            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Flex justifyContent="between" className="font-semibold">                  <Text>Total a Pagar:</Text>
                  <Text>S/ {totalVenta.toFixed(2)}</Text>
                </Flex>
                {parseFloat(montoPagado) > totalVenta && (
                  <Flex justifyContent="between" className="text-blue-600">                    <Text>Vuelto:</Text>
                    <Text>S/ {(parseFloat(montoPagado) - totalVenta).toFixed(2)}</Text>
                  </Flex>
                )}
              </div>
            </div>            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={loading ? Loader2 : CheckCircle}
                disabled={loading || !montoPagado || parseFloat(montoPagado) < totalVenta}
                onClick={procesarPago}
              >
                {loading ? 'Procesando...' : 'Finalizar Venta'}              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Panel de Detalles de Venta */}
      {mostrarDetalles && !mostrarPago && (
        <Card>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Title>Detalles de la Venta</Title>
              <Text>Venta #{ventaCreada?.idVenta}</Text>
            </div><div className="flex gap-4">
              <div className="flex-1">
                <SearchSelect
                  value={productoSeleccionado}
                  onValueChange={setProductoSeleccionado}
                  placeholder="Buscar producto..."
                  className="w-full"
                >                  {productos.map((producto) => (
                    <SearchSelectItem
                      key={producto.id}
                      value={producto.id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{producto.nombre}</span>
                      </div>
                    </SearchSelectItem>
                  ))}
                </SearchSelect>
              </div>
              <Button
                icon={Plus}
                variant="primary"
                onClick={() => {
                  if (productoSeleccionado) {
                    setCantidad(1);
                    agregarDetalle();
                  }
                }}
                disabled={!productoSeleccionado}
              >
                Agregar Producto
              </Button>
            </div>

            {formErrors.detalles && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text color="red">{formErrors.detalles}</Text>
              </div>
            )}

            {detallesVenta.length > 0 && (
              <Table>                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Producto</TableHeaderCell>
                    <TableHeaderCell>Stock</TableHeaderCell>
                    <TableHeaderCell>Cantidad</TableHeaderCell>
                    <TableHeaderCell>Precio Unit.</TableHeaderCell>
                    <TableHeaderCell>Subtotal</TableHeaderCell>
                    <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detallesVenta.map((detalle, index) => (
                    <TableRow key={index}>                      <TableCell>{detalle.producto.nombre}</TableCell>
                      <TableCell>
                        {productos.find(p => p.id === detalle.productoId)?.stockTotal || 0}
                      </TableCell>
                      <TableCell>
                        <NumberInput
                          value={detalle.cantidad}
                          onValueChange={(value) => actualizarCantidad(detalle.productoId, value)}
                          min={1}
                          className="w-24"
                        />
                      </TableCell>                      <TableCell>S/ {detalle.producto.precio.toFixed(2)}</TableCell>
                      <TableCell>S/ {(detalle.cantidad * detalle.producto.precio).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="light"
                          color="red"
                          icon={Trash2}
                          onClick={() => eliminarDetalle(detalle.productoId)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>                    <TableCell colSpan={4} className="text-right font-medium">
                      Total:
                    </TableCell>                    <TableCell className="font-medium" colSpan={2}>
                      S/ {totalVenta.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                icon={loading ? Loader2 : CreditCard}
                disabled={loading || detallesVenta.length === 0}
                onClick={guardarDetalles}
              >
                {loading ? 'Guardando...' : 'Proceder al Pago'}
              </Button>            </div>
          </div>
        </Card>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default VentaPage;