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
const [ventaTemp, setVentaTemp] = useState(null); // venta temporal
const [productos, setProductos] = useState([]);
const [detallesVenta, setDetallesVenta] = useState([]);
const [productoSeleccionado, setProductoSeleccionado] = useState('');
const [cantidad, setCantidad] = useState(1);
const [openSnackbar, setOpenSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [snackbarSeverity, setSnackbarSeverity] = useState('success');
const [montoPagado, setMontoPagado] = useState('');
const [metodoPago, setMetodoPago] = useState('EFECTIVO');
const [totalVenta, setTotalVenta] = useState(0);
const [pasoActual, setPasoActual] = useState(1); // 1: datos, 2: detalles, 3: pago, 4: confirmación

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
    // (Eliminado: setSuccess, no está definido ni utilizado)

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
  setFormErrors({});
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  try {
    // Formatear IDs
    const clienteId = parseInt(formData.clienteId.replace('cli-', ''));
    const empleadoId = parseInt(formData.empleadoId.replace('emp-', ''));
    if (isNaN(clienteId) || isNaN(empleadoId)) {
      throw new Error('ID de cliente o empleado inválido');
    }
    // Estructura temporal de venta
    const ventaTempObj = {
      idVenta: Date.now(),
      clienteId,
      empleadoId
    };
    setVentaTemp(ventaTempObj);
    setPasoActual(2); // Avanzar a detalles
    showNotification('Datos registrados. Continúe agregando productos a la venta', 'success');
    // Cargar productos para el siguiente paso
    setLoading(true);
    const response = await productosAPI.listarProductos();
    const productosFormateados = response
      .filter(p => p && p.idProducto && p.estado)
      .map(p => ({
        id: p.idProducto,
        nombre: p.nombre || 'Sin nombre',
        precio: p.precioVenta ? parseFloat(p.precioVenta) : 0,
        stockTotal: p.stockTotal || 0,
        categoria: p.categoria?.nombre || 'Sin categoría'
      }));
    setProductos(productosFormateados);
  } catch (err) {
    setFormErrors({ submit: `Error: ${err.message}` });
    showNotification(`Error: ${err.message}`, 'error');
  } finally {
    setLoading(false);
  }
};

  // (Eliminado: useEffect dependiente de mostrarDetalles, ya no es necesario)
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
// Guardar detalles y avanzar a pago
const guardarDetalles = () => {
  if (!ventaTemp || !ventaTemp.idVenta) {
    showNotification('Error: No se encontró la venta temporal', 'error');
    return;
  }
  if (detallesVenta.length === 0) {
    showNotification('Error: No hay productos agregados', 'error');
    return;
  }
  setPasoActual(3); // Avanzar a pago
  showNotification('Productos agregados. Continúe con el registro del pago', 'success');
};
// Procesar pago y enviar todo al backend
const procesarPago = async () => {
  if (!montoPagado || parseFloat(montoPagado) <= 0) {
    showNotification('Error: Ingrese un monto válido', 'error');
    return;
  }
  if (parseFloat(montoPagado) < totalVenta) {
    showNotification('Error: El monto pagado es menor al total de la venta', 'error');
    return;
  }
  setLoading(true);
  try {
    // Validar clienteId antes de enviar
    if (!ventaTemp || !ventaTemp.clienteId || isNaN(ventaTemp.clienteId)) {
      showNotification('Error: Debe seleccionar un cliente válido antes de registrar la venta.', 'error');
      setLoading(false);
      return;
    }
    // Preparar estructura completa de la venta
    const ventaCompleta = {
      clienteId: ventaTemp.clienteId,
      empleadoId: ventaTemp.empleadoId,
      detalles: detallesVenta.map(detalle => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidad
      })),
      montoPagado: parseFloat(montoPagado),
      metodoPago: metodoPago
    };
    console.log('Enviando ventaCompleta a la API:', JSON.stringify(ventaCompleta, null, 2));
    // Enviar todo en una sola llamada
    await ventasAPI.crearVentaCompleta(ventaCompleta);
    setVentaTemp(null);
    setDetallesVenta([]);
    setMontoPagado('');
    setMetodoPago('EFECTIVO');
    setFormData({ empleadoId: empleados[0]?.id || '', clienteId: '' });
    setDni('');
    setClienteEncontrado(null);
    setPasoActual(4); // Confirmación
    showNotification('Venta registrada exitosamente', 'success');
  } catch (error) {
    showNotification(`Error al registrar la venta: ${error.message}`, 'error');
    console.error('Error al registrar la venta:', error);
  } finally {
    setLoading(false);
  }
};

  // (Eliminado: recargarDatos no se utiliza)

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

// Progreso visual
const ProgresoVenta = ({ pasoActual }) => {
  const pasos = [
    { numero: 1, nombre: 'Datos cliente' },
    { numero: 2, nombre: 'Productos' },
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
  <div className="space-y-6 p-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Venta</h1>
        <p className="text-gray-500">Registra una nueva venta</p>
      </div>
    </div>
    <ProgresoVenta pasoActual={pasoActual} />

    {formErrors.fetch && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <Text color="red">{formErrors.fetch}</Text>
        </div>
      </div>
    )}

    {/* Paso 1: Datos básicos */}
    {pasoActual === 1 && (
      <Card className="mb-6">
        <div className="space-y-6">
          <Title>Información Básica</Title>
          <div className="space-y-6">
            <div className="border p-4 rounded-lg bg-gray-50">
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
              <Text className="mb-2">Empleado</Text>
              <SearchSelect
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
              <Text className="mb-2">Cliente</Text>
              <SearchSelect
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
    )}

    {/* Paso 2: Detalles de venta */}
    {pasoActual === 2 && (
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Title>Detalles de la Venta</Title>
            <Text>Venta #{ventaTemp?.idVenta}</Text>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchSelect
                value={productoSeleccionado}
                onValueChange={setProductoSeleccionado}
                placeholder="Buscar producto..."
                className="w-full"
              >
                {productos.map((producto) => (
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
            <Table>
              <TableHead>
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
                  <TableRow key={index}>
                    <TableCell>{detalle.producto.nombre}</TableCell>
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
                    </TableCell>
                    <TableCell>S/ {detalle.producto.precio.toFixed(2)}</TableCell>
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
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total:
                  </TableCell>
                  <TableCell className="font-medium" colSpan={2}>
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
            </Button>
          </div>
        </div>
      </Card>
    )}

    {/* Paso 3: Pago */}
    {pasoActual === 3 && (
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
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <Flex justifyContent="between" className="font-semibold">
                <Text>Total a Pagar:</Text>
                <Text>S/ {totalVenta.toFixed(2)}</Text>
              </Flex>
              {parseFloat(montoPagado) > totalVenta && (
                <Flex justifyContent="between" className="text-blue-600">
                  <Text>Vuelto:</Text>
                  <Text>S/ {(parseFloat(montoPagado) - totalVenta).toFixed(2)}</Text>
                </Flex>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={loading ? Loader2 : CheckCircle}
              disabled={loading || !montoPagado || parseFloat(montoPagado) < totalVenta}
              onClick={procesarPago}
            >
              {loading ? 'Procesando...' : 'Finalizar Venta'}
            </Button>
          </div>
        </div>
      </Card>
    )}

    {/* Paso 4: Confirmación */}
    {pasoActual === 4 && (
      <Card className="p-8 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
        <Title>¡Venta registrada exitosamente!</Title>
        <Text>La venta ha sido registrada y procesada correctamente.</Text>
        <Button className="mt-6" variant="primary" onClick={() => setPasoActual(1)}>
          Registrar otra venta
        </Button>
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