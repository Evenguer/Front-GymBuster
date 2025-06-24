import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels, Metric, Flex, ProgressBar } from '@tremor/react';
import { AreaChart, DonutChart, BarChart } from '@tremor/react';
import { Calendar, Users, DollarSign, Package, AlertTriangle, Clock } from 'react-feather';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    empleados: 0,
    clientes: 0,
    ventasHoy: 0,
    ventasTotales: 0,
    productosAgotados: 0,
    nuevasInscripciones: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Datos de ejemplo para las gráficas
  const chartdata = [
    {
      date: 'Ene 23',
      Ventas: 2890,
      Inscripciones: 2400,
    },
    {
      date: 'Feb 23',
      Ventas: 1890,
      Inscripciones: 1398,
    },
    {
      date: 'Mar 23',
      Ventas: 3090,
      Inscripciones: 2800,
    },
    {
      date: 'Abr 23',
      Ventas: 2390,
      Inscripciones: 2108,
    },
    {
      date: 'May 23',
      Ventas: 3490,
      Inscripciones: 2980,
    },
    {
      date: 'Jun 23',
      Ventas: 2590,
      Inscripciones: 2300,
    },
  ];
  
  const productosPorCategoria = [
    { name: 'Proteínas', value: 35 },
    { name: 'Equipamiento', value: 25 },
    { name: 'Accesorios', value: 20 },
    { name: 'Ropa', value: 15 },
    { name: 'Otros', value: 5 },
  ];
  
  // Ejemplo para obtener datos del backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Aquí harías peticiones al backend para obtener datos reales
        // const response = await axios.get('/api/admin/dashboard');
        // setStats(response.data);
        
        // Por ahora usamos datos de ejemplo
        setStats({
          empleados: 12,
          clientes: 145,
          ventasHoy: 8,
          ventasTotales: 4590,
          productosAgotados: 3,
          nuevasInscripciones: 5
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Bienvenido al panel de administración de Busster GYM</p>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card decoration="top" decorationColor="indigo">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-indigo-100 rounded-md">
              <Users size={20} className="text-indigo-500" />
            </div>
            <div>
              <Text>Clientes Activos</Text>
              <Metric>{stats.clientes}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="emerald">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-emerald-100 rounded-md">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            <div>
              <Text>Ventas Hoy</Text>
              <Metric>{stats.ventasHoy}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="amber">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-amber-100 rounded-md">
              <Calendar size={20} className="text-amber-500" />
            </div>
            <div>
              <Text>Nuevas Inscripciones</Text>
              <Metric>{stats.nuevasInscripciones}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="rose">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-rose-100 rounded-md">
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <div>
              <Text>Productos Agotados</Text>
              <Metric>{stats.productosAgotados}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-blue-100 rounded-md">
              <Users size={20} className="text-blue-500" />
            </div>
            <div>
              <Text>Empleados</Text>
              <Metric>{stats.empleados}</Metric>
            </div>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="green">
          <Flex justifyContent="start" className="space-x-4">
            <div className="p-2 bg-green-100 rounded-md">
              <DollarSign size={20} className="text-green-500" />
            </div>
            <div>
              <Text>Ventas Totales (S/.)</Text>
              <Metric>{stats.ventasTotales}</Metric>
            </div>
          </Flex>
        </Card>
      </div>
      
      {/* Gráficos */}
      <TabGroup>
        <TabList className="mb-4">
          <Tab>Resumen de Ventas</Tab>
          <Tab>Productos</Tab>
          <Tab>Actividad de Clientes</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[400px]">
                <Title>Tendencia de Ventas e Inscripciones</Title>
                <Text>Comparativa mensual</Text>
                <AreaChart
                  className="mt-4 h-80" 
                  data={chartdata}
                  index="date"
                  categories={["Ventas", "Inscripciones"]}
                  colors={["indigo", "emerald"]}
                  minValue={0}
                  showLegend
                  showGridLines
                  showAnimation
                />
              </Card>
              
              <Card className="h-[400px]">
                <Title>Ventas por Categoría</Title>
                <Text>Distribución de productos vendidos</Text>
                <DonutChart
                  className="mt-4 h-80"
                  data={productosPorCategoria}
                  category="value"
                  index="name"
                  colors={["indigo", "emerald", "amber", "sky", "rose"]}
                  showAnimation
                  showLabel
                />
              </Card>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[400px]">
                <Title>Productos Más Vendidos</Title>
                <BarChart
                  className="mt-4 h-80"
                  data={[
                    { name: 'Proteína Whey', value: 45 },
                    { name: 'Guantes de Entrenamiento', value: 35 },
                    { name: 'Cinturón de Levantamiento', value: 28 },
                    { name: 'Shaker', value: 25 },
                    { name: 'Toalla', value: 20 }
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  showAnimation
                  showLegend={false}
                />
              </Card>
              
              <Card className="h-[400px]">
                <Title>Nivel de Inventario</Title>
                <Text>Productos con bajo stock</Text>
                <div className="mt-4 space-y-4">
                  <div>
                    <Flex>
                      <Text>Proteína Vegana (5%)</Text>
                      <Text>2 unidades</Text>
                    </Flex>
                    <ProgressBar value={5} color="red" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text>Guantes L (15%)</Text>
                      <Text>3 unidades</Text>
                    </Flex>
                    <ProgressBar value={15} color="amber" className="mt-2" />
                  </div>
                  <div>
                    <Flex>
                      <Text>Cintas de Resistencia (25%)</Text>
                      <Text>5 unidades</Text>
                    </Flex>
                    <ProgressBar value={25} color="emerald" className="mt-2" />
                  </div>
                </div>
              </Card>
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="h-[400px]">
                <Title>Asistencias por Día</Title>
                <BarChart
                  className="mt-4 h-80"
                  data={[
                    { name: 'Lunes', value: 36 },
                    { name: 'Martes', value: 42 },
                    { name: 'Miércoles', value: 45 },
                    { name: 'Jueves', value: 40 },
                    { name: 'Viernes', value: 38 },
                    { name: 'Sábado', value: 25 },
                    { name: 'Domingo', value: 15 }
                  ]}
                  index="name"
                  categories={["value"]}
                  colors={["emerald"]}
                  showAnimation
                  showLegend={false}
                />
              </Card>
              
              <Card className="h-[400px]">
                <Title>Distribución de Clientes por Plan</Title>
                <DonutChart
                  className="mt-4 h-80"
                  data={[
                    { name: 'Plan Mensual', value: 45 },
                    { name: 'Plan Trimestral', value: 30 },
                    { name: 'Plan Semestral', value: 20 },
                    { name: 'Plan Anual', value: 5 }
                  ]}
                  category="value"
                  index="name"
                  colors={["indigo", "sky", "violet", "emerald"]}
                  showAnimation
                  showLabel
                />
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      
      {/* Sección de actividades recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Title>Actividades Recientes</Title>
          <div className="mt-4 space-y-4">
            <div className="flex gap-4 items-start border-b border-gray-100 pb-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Nuevo cliente registrado</p>
                <p className="text-sm text-gray-500">Luis Torres se ha registrado como nuevo cliente</p>
                <span className="text-xs text-gray-400">Hace 2 horas</span>
              </div>
            </div>
            
            <div className="flex gap-4 items-start border-b border-gray-100 pb-3">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign size={16} className="text-green-500" />
              </div>
              <div>
                <p className="font-medium">Nueva venta</p>
                <p className="text-sm text-gray-500">Carlos Mendoza ha registrado una venta de S/. 125.00</p>
                <span className="text-xs text-gray-400">Hace 4 horas</span>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-amber-100 rounded-full">
                <Package size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="font-medium">Stock bajo</p>
                <p className="text-sm text-gray-500">El producto "Proteína Whey" está por debajo del stock mínimo</p>
                <span className="text-xs text-gray-400">Hace 6 horas</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <Title>Horarios de Empleados Hoy</Title>
          <div className="mt-4 space-y-4">
            <div className="flex gap-4 items-start border-b border-gray-100 pb-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock size={16} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Juan Pérez - Entrenador</p>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Mañana: 8:00 - 12:00</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 items-start border-b border-gray-100 pb-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock size={16} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Ana López - Recepcionista</p>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Mañana: 7:00 - 15:00</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Activo</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock size={16} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Carlos Ruiz - Entrenador</p>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Tarde: 16:00 - 22:00</p>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Próximo</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;