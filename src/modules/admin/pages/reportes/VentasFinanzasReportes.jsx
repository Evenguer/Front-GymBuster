import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Title, 
  Text, 
  Tab, 
  TabList, 
  TabGroup, 
  TabPanel, 
  TabPanels,
  BarChart,
  DonutChart,
  LineChart,
  Grid,
  Flex,
  Select,
  SelectItem,
  Metric,
  ProgressBar,
  Legend
} from '@tremor/react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  BarChart2,
  PieChart,
  AlertTriangle
} from 'react-feather';
import { obtenerDatosFinancieros } from '../../services/reportes/reportesFinancierosAPI';

const formatoPeso = (valor) => {
  return `S/ ${valor.toLocaleString('es-PE')}`;
};

// Función para exportar el reporte actual como PDF
const exportarReportePDF = (datosFinancieros, periodo) => {
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString('es-PE');
      const periodoTexto = periodo === 'mensual' ? 'Mensual' : 
                          periodo === 'trimestral' ? 'Trimestral' : 'Anual';
      
      // Título del reporte
      doc.setFontSize(18);
      doc.text('Reporte de Ventas y Finanzas', 15, 20);
      
      doc.setFontSize(12);
      doc.text(`Periodo: ${periodoTexto} - Generado el ${fecha}`, 15, 30);
      
      // Ingresos Totales
      doc.setFontSize(14);
      doc.text('Resumen Financiero', 15, 40);
      
      doc.setFontSize(11);
      doc.text(`Ingresos Totales: ${formatoPeso(datosFinancieros.ingresosTotales)}`, 20, 50);
      
      // Tabla de desglose de ingresos
      doc.autoTable({
        startY: 55,
        head: [['Categoría', 'Ingresos']],
        body: datosFinancieros.datosDesglosados.map(item => [
          item.categoria, 
          formatoPeso(item.valor)
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 15 },
      });
      
      // Productos más vendidos
      doc.setFontSize(14);
      doc.text('Top 5 Productos más Vendidos', 15, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Producto', 'Unidades', 'Ingresos']],
        body: datosFinancieros.productosMasVendidos.slice(0, 5).map(item => [
          item.nombre, 
          item.unidades, 
          formatoPeso(item.ingresos)
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 15 },
      });
      
      // Análisis de Rentabilidad
      doc.setFontSize(14);
      doc.text('Análisis de Rentabilidad', 15, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Producto', 'Costo', 'Precio Venta', 'Margen (%)']],
        body: datosFinancieros.analisisRentabilidad.map(item => [
          item.producto, 
          formatoPeso(item.costo), 
          formatoPeso(item.precio), 
          `${item.margen.toFixed(1)}%`
        ]),
        headStyles: { fillColor: [30, 41, 59] },
        margin: { left: 15 },
      });
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`GymBuster - Página ${i} de ${pageCount}`, 15, doc.internal.pageSize.height - 10);
      }
      
      // Guardar el PDF
      doc.save(`Reporte_Ventas_Finanzas_${periodo}_${fecha.replace(/\//g, '-')}.pdf`);
    });
  });
};

const ReportesVentasFinanzas = () => {
  const [periodo, setPeriodo] = useState('mensual');
  const [datosFinancieros, setDatosFinancieros] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [recargando, setRecargando] = useState(false);
    const cargarDatos = async (periodoParam = periodo) => {
    if (!recargando) setRecargando(true);
    if (!cargando) setCargando(true);
    setError(null);
    
    try {
      const datos = await obtenerDatosFinancieros(periodoParam);
      setDatosFinancieros(datos);
      console.log('Datos financieros cargados correctamente');
    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
      setError('Ocurrió un error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setCargando(false);
      setRecargando(false);
    }
  };
  
  const cambiarPeriodo = (nuevoPeriodo) => {
    if (periodo !== nuevoPeriodo) {
      setPeriodo(nuevoPeriodo);
      cargarDatos(nuevoPeriodo);
    }
  };
  
  const recargarDatos = () => {
    cargarDatos();
  };

  useEffect(() => {
    cargarDatos();
    // Solo se ejecuta al montar el componente, ya que cambiarPeriodo maneja las recargas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <Text>Cargando datos financieros...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <AlertTriangle size={48} className="text-amber-500" />
        <Title>No se pudieron cargar los datos financieros</Title>
        <Text>{error}</Text>
        <div className="flex space-x-3">
          <button 
            onClick={recargarDatos} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
  
  if (!datosFinancieros) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <Text>Inicializando panel financiero...</Text>
      </div>
    );
  }

  // Datos para gráficos
  const datosGraficaDesglose = datosFinancieros.datosDesglosados.map(item => ({
    name: item.categoria,
    value: item.valor
  }));

  const datosGraficaCategorias = datosFinancieros.ventasPorCategoria.map(item => ({
    name: item.categoria,
    value: item.valor
  }));

  const datosTendencia = datosFinancieros.tendenciaVentas.map(item => ({
    date: item.mes,
    "Ventas": item.ventas
  }));

  // Componente para el overlay de carga
  const LoadingOverlay = () => {
    if (!recargando) return null;
    
    return (
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
        <div className="flex flex-col items-center p-4 rounded-lg bg-white shadow-md">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
          <Text className="text-indigo-600 font-medium">Actualizando datos...</Text>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Title className="text-2xl font-bold mb-2">Reportes de Ventas y Finanzas</Title>
          <Text>Análisis detallado de los ingresos, ventas y rentabilidad del negocio</Text>
        </div>
        <button 
          onClick={() => exportarReportePDF(datosFinancieros, periodo)} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          disabled={recargando}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Selector de Periodo */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => cambiarPeriodo('mensual')}
              className={`px-4 py-2 rounded-lg transition-all ${periodo === 'mensual' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Mensual
            </button>
            <button 
              onClick={() => cambiarPeriodo('trimestral')}
              className={`px-4 py-2 rounded-lg transition-all ${periodo === 'trimestral' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Trimestral
            </button>
            <button 
              onClick={() => cambiarPeriodo('anual')}
              className={`px-4 py-2 rounded-lg transition-all ${periodo === 'anual' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Anual
            </button>
          </div>
          
          <button 
            onClick={recargarDatos}
            disabled={recargando || cargando}
            className="flex items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Actualizar datos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${recargando ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="ml-1">Actualizar</span>
          </button>
        </div>
        
        {recargando && (
          <div className="mt-2 flex items-center text-xs text-indigo-600">
            <div className="animate-spin mr-2 h-3 w-3 border-t-2 border-indigo-600 rounded-full"></div>
            Actualizando datos...
          </div>
        )}
      </div>

      <TabGroup>
        <TabList className="mb-4">
          <Tab icon={DollarSign}>Resumen Financiero</Tab>
          <Tab icon={PieChart}>Análisis por Categoría</Tab>
          <Tab icon={ShoppingBag}>Productos más Vendidos</Tab>
          <Tab icon={TrendingUp}>Tendencias</Tab>
          <Tab icon={BarChart2}>Rentabilidad</Tab>
        </TabList>
        
        <TabPanels>
          {/* Pestaña 1: Resumen Financiero */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
              <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-6">
                <Card decoration="top" decorationColor="indigo">
                  <Flex justifyContent="start" className="space-x-4">
                    <DollarSign size={28} className="text-indigo-500" />
                    <div>
                      <Text>Ingresos Totales</Text>
                      <Metric>{formatoPeso(datosFinancieros.ingresosTotales)}</Metric>
                    </div>
                  </Flex>
                </Card>
                
                <Card decoration="top" decorationColor="emerald">
                  <Flex justifyContent="start" className="space-x-4">
                    <TrendingUp size={28} className="text-emerald-500" />
                    <div>
                      <Text>Crecimiento vs. Periodo Anterior</Text>
                      <Metric>+8.2%</Metric>
                    </div>
                  </Flex>
                </Card>
                
                <Card decoration="top" decorationColor="amber">
                  <Flex justifyContent="start" className="space-x-4">
                    <ShoppingBag size={28} className="text-amber-500" />
                    <div>
                      <Text>Total de Transacciones</Text>
                      <Metric>862</Metric>
                    </div>
                  </Flex>
                </Card>
              </Grid>

              <Card className="mb-6 relative">
              <Title>Desglose de Ingresos</Title>
              <Text>Distribución de ingresos por tipo de operación</Text>
              <DonutChart
                data={datosGraficaDesglose}
                category="value"
                index="name"
                valueFormatter={formatoPeso}
                colors={["indigo", "emerald", "amber"]}
                className="h-80 mt-6"
              />
              <Legend
                categories={datosFinancieros.datosDesglosados.map(item => item.categoria)}
                colors={["indigo", "emerald", "amber"]}
                className="mt-3"
              />
            </Card>
            </div>
          </TabPanel>

          {/* Pestaña 2: Análisis por Categoría */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
              <Card className="mb-6">
                <Title>Ventas por Categoría</Title>
                <Text>Distribución de ventas entre las diferentes categorías de productos</Text>
                <BarChart
                  data={datosGraficaCategorias}
                  index="name"
                  categories={["value"]}
                  colors={["indigo"]}
                  valueFormatter={formatoPeso}
                  yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>

            <Grid numItems={1} numItemsSm={2} className="gap-6">
              <Card>
                <Title>Distribución Porcentual</Title>
                <Text>Contribución de cada categoría al total de ventas</Text>
                <DonutChart
                  data={datosGraficaCategorias}
                  category="value"
                  index="name"
                  valueFormatter={(value) => `${((value / datosFinancieros.ingresosTotales) * 100).toFixed(1)}%`}
                  colors={["indigo", "violet", "emerald", "amber"]}
                  className="h-60 mt-6"
                />
              </Card>

              <Card>
                <Title>Rendimiento por Categoría</Title>
                <Text>Cumplimiento de objetivos por categoría</Text>
                {datosFinancieros.ventasPorCategoria.map((item, index) => (
                  <div key={index} className="mt-4">
                    <Flex>
                      <Text>{item.categoria}</Text>
                      <Text>{Math.round((item.valor / datosFinancieros.ingresosTotales) * 100)}%</Text>
                    </Flex>
                    <ProgressBar
                      value={(item.valor / datosFinancieros.ingresosTotales) * 100}
                      color={["indigo", "violet", "emerald", "amber"][index % 4]}
                      className="mt-2"
                    />
                  </div>
                ))}
              </Card>
            </Grid>
            </div>
          </TabPanel>

          {/* Pestaña 3: Productos más Vendidos */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
              <Card className="mb-6">
                <Title>Top 10 Productos más Vendidos</Title>
                <Text>Productos con mayor rotación e ingresos generados</Text>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades Vendidas</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datosFinancieros.productosMasVendidos.map((producto, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.unidades}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoPeso(producto.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <Title>Distribución de Ventas - Top Productos</Title>
              <Text>Comparativa de ingresos generados por los productos más vendidos</Text>
              <BarChart
                data={datosFinancieros.productosMasVendidos.slice(0, 5)}
                index="nombre"
                categories={["ingresos"]}
                colors={["indigo"]}
                valueFormatter={formatoPeso}
                yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>
            </div>
          </TabPanel>

          {/* Pestaña 4: Tendencias */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
            <Card className="mb-6">
              <Title>Evolución de Ventas</Title>
              <Text>Tendencia de ventas durante los últimos 6 meses</Text>
              <LineChart
                data={datosTendencia}
                index="date"
                categories={["Ventas"]}
                colors={["indigo"]}
                valueFormatter={formatoPeso}
                yAxisWidth={80}
                className="h-80 mt-6"
              />
            </Card>

            <Grid numItems={1} numItemsSm={2} className="gap-6">
              <Card>
                <Title>Comparativa con Periodo Anterior</Title>
                <Text>Diferencia porcentual respecto al periodo anterior</Text>
                <div className="mt-6">
                  {[
                    { mes: "Febrero", cambio: "+6.7%", positivo: true },
                    { mes: "Marzo", cambio: "-12.5%", positivo: false },
                    { mes: "Abril", cambio: "+25.0%", positivo: true },
                    { mes: "Mayo", cambio: "+11.4%", positivo: true },
                    { mes: "Junio", cambio: "+7.7%", positivo: true }
                  ].map((item, index) => (
                    <div key={index} className="mb-4 flex items-center justify-between">
                      <Text>{item.mes}</Text>
                      <Text className={`font-medium ${item.positivo ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.cambio}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <Title>Predicción Próximo Periodo</Title>
                <Text>Proyección de ventas para los próximos meses</Text>
                <LineChart
                  data={[
                    ...datosTendencia,
                    { date: "Jul", "Ventas": 45000 },
                    { date: "Ago", "Ventas": 48000 },
                    { date: "Sep", "Ventas": 52000 }
                  ]}
                  index="date"
                  categories={["Ventas"]}
                  colors={["indigo"]}
                  valueFormatter={formatoPeso}
                  className="h-60 mt-6"
                />
              </Card>
            </Grid>
            </div>
          </TabPanel>

          {/* Pestaña 5: Rentabilidad */}
          <TabPanel>
            <div className="relative">
              {recargando && <LoadingOverlay />}
            <Card className="mb-6">
              <Title>Análisis de Rentabilidad por Producto</Title>
              <Text>Margen de ganancia de los productos más destacados</Text>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen (%)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datosFinancieros.analisisRentabilidad.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.producto}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoPeso(item.costo)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatoPeso(item.precio)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.margen >= 50 ? 'bg-emerald-100 text-emerald-800' : 
                                item.margen >= 30 ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'}`}
                          >
                            {item.margen.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Grid numItems={1} numItemsSm={2} className="gap-6">
              <Card>
                <Title>Margen por Producto</Title>
                <Text>Comparativa del margen de ganancia</Text>
                <BarChart
                  data={datosFinancieros.analisisRentabilidad}
                  index="producto"
                  categories={["margen"]}
                  colors={["indigo"]}
                  valueFormatter={(v) => `${v.toFixed(1)}%`}
                  className="h-60 mt-6"
                />
              </Card>

              <Card>
                <Title>Costos vs Ingresos</Title>
                <Text>Relación entre costos e ingresos por producto</Text>
                <BarChart
                  data={datosFinancieros.analisisRentabilidad}
                  index="producto"
                  categories={["costo", "precio"]}
                  colors={["amber", "indigo"]}
                  valueFormatter={formatoPeso}
                  stack={false}
                  className="h-60 mt-6"
                />
              </Card>
            </Grid>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default ReportesVentasFinanzas;
