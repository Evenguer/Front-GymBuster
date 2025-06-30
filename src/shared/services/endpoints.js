export const BASE_URL = 'http://localhost:8080/api'; // Forzar URL específica para pruebas

console.log("BASE_URL configurada como:", BASE_URL);

export const ENDPOINTS = {  
  BASE_URL,
  TOGGLE_CLIENT_STATUS: (id) => `${BASE_URL}/personas/clientes/${id}/estado`,
  UPDATE_CLIENT: (id) => `${BASE_URL}/personas/clientes/${id}`,
  // Ventas
  VENTAS: {
    LISTAR: `${BASE_URL}/venta/listar`,
    DETALLE: `${BASE_URL}/venta/detalle`,
  },
  
  // Piezas
  PIEZA: {
    LISTAR: `${BASE_URL}/pieza/listar`,
    GUARDAR: `${BASE_URL}/pieza/guardar`,
    ACTUALIZAR: `${BASE_URL}/pieza/actualizar`,
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/pieza/${id}/estado`,
    ELIMINAR: (id) => `${BASE_URL}/pieza/eliminar/${id}`
  },

  // Alquileres
  ALQUILER: {
    LISTAR: `${BASE_URL}/alquiler/listar`,
    GUARDAR: `${BASE_URL}/alquiler/guardar`, 
    CREAR_COMPLETO: `${BASE_URL}/alquiler/crear-completo`, 
    CAMBIAR_ESTADO: (id) => `${BASE_URL}/alquiler/cambiar-estado/${id}`,
    FINALIZAR: (id) => `${BASE_URL}/alquiler/finalizar/${id}`,
    CANCELAR: (id) => `${BASE_URL}/alquiler/cancelar/${id}`,
    VENCIDO: (id) => `${BASE_URL}/alquiler/vencido/${id}`,
    REGISTRAR_DEVOLUCION: (id) => `${BASE_URL}/alquiler/registrar-devolucion/${id}`,
    DETALLE: {
      AGREGAR_LOTE: `${BASE_URL}/alquiler/detalle/agregar-lote`,
      LISTAR: (id) => `${BASE_URL}/alquiler/detalle/listar/${id}`,
      ELIMINAR: (id) => `${BASE_URL}/alquiler/detalle/eliminar/${id}`
    },
    PAGO: {
      REGISTRAR: `${BASE_URL}/alquiler/pago/registrar`
    },
    VERIFICAR_VENCIDOS: `${BASE_URL}/alquiler/verificar-vencidos`,
  },

  // Auth
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`, // Único endpoint para registrar todo tipo de usuarios
  GET_USERS: `${BASE_URL}/auth/usuarios`,
  // Perfil Cliente (autenticado)
  CLIENT_PROFILE: `${BASE_URL}/auth/perfil`,
  CLIENT_CHANGE_PASSWORD: `${BASE_URL}/auth/perfil/cambiar-contrasena`,
  
  GET_USERS_SECURITY: `${BASE_URL}/auth/usuarios/seguridad`,
  TOGGLE_USER_STATUS: (id) => `${BASE_URL}/auth/usuarios/${id}/estado`,
  LIST_CLIENTS: `${BASE_URL}/personas/clientes`,
  LIST_EMPLOYEES: `${BASE_URL}/personas/empleados`,
  UPDATE_EMPLOYEE: (id) => `${BASE_URL}/personas/empleados/${id}`,
  GET_EMPLOYEE: (id) => `${BASE_URL}/personas/empleados/${id}`,
  GET_CLIENT: (id) => `${BASE_URL}/personas/clientes/${id}`,
  GET_USUARIO_DETAILS: (id) => `${BASE_URL}/auth/usuarios/${id}/detalles`,


  
  // Plan
  SAVE_PLAN: `${BASE_URL}/plan/guardar`,
  LIST_PLANS: `${BASE_URL}/plan/listar`,
  UPDATE_PLAN: `${BASE_URL}/plan/actualizar`,
  TOGGLE_PLAN_STATUS: (id) => `${BASE_URL}/plan/${id}/estado`,
  DELETE_PLAN: (id) => `${BASE_URL}/plan/eliminar/${id}`,
  
 // Horario Empleado
    LIST_SCHEDULES: `${BASE_URL}/horario-empleado/listar`,
    ADD_SCHEDULE: (empleadoId) => `${BASE_URL}/horario-empleado/agregar/${empleadoId}`,
    UPDATE_SCHEDULE: (id) => `${BASE_URL}/horario-empleado/actualizar/${id}`,
    DELETE_SCHEDULE: (id) => `${BASE_URL}/horario-empleado/eliminar/${id}`,
    TOGGLE_SCHEDULE_STATUS: (id) => `${BASE_URL}/horario-empleado/${id}/estado`,    LIST_SCHEDULES_BY_EMPLOYEE_AND_DAY: (empleadoId, dia) => `${BASE_URL}/horario-empleado/empleado/${empleadoId}/dia/${dia}`,

  // Asistencia Empleado
  MARK_ATTENDANCE: `${BASE_URL}/asistencia/marcar`,
  LIST_ATTENDANCE: `${BASE_URL}/asistencia/listar`,
  
  // Categoría
  SAVE_CATEGORY: `${BASE_URL}/categoria/guardar`,
  UPDATE_CATEGORY: `${BASE_URL}/categoria/actualizar`,
  TOGGLE_CATEGORY_STATUS: (id) => `${BASE_URL}/categoria/${id}/estado`,
  LIST_CATEGORIES: `${BASE_URL}/categoria/listar`,
  DELETE_CATEGORY: (id) => `${BASE_URL}/categoria/eliminar/${id}`,
    // Producto
  SAVE_PRODUCT: `${BASE_URL}/producto/guardar`,
  UPDATE_PRODUCT: `${BASE_URL}/producto/actualizar`,
  TOGGLE_PRODUCT_STATUS: (id) => `${BASE_URL}/producto/${id}/estado`,
  LIST_PRODUCTS: `${BASE_URL}/producto/listar`,
  DELETE_PRODUCT: (id) => `${BASE_URL}/producto/eliminar/${id}`,
  
  // Venta
  LIST_SALES: `${BASE_URL}/venta/listar`,
  LIST_SALES_WITH_DETAILS: `${BASE_URL}/venta/listar-con-detalles`,
  SAVE_SALE: `${BASE_URL}/venta/guardar`,
  GET_SALE_DETAILS: (id) => `${BASE_URL}/venta/${id}/detalle`,
  ADD_SALE_DETAILS: `${BASE_URL}/venta/detalle/agregar`,
  ADD_SALE_DETAILS_BATCH: `${BASE_URL}/venta/detalle/agregar-lote`,
  DELETE_SALE_DETAIL: (id) => `${BASE_URL}/venta/detalle/${id}`,
  TOGGLE_SALE_STATUS: (id) => `${BASE_URL}/venta/${id}/estado`,
  REGISTER_PAYMENT: `${BASE_URL}/venta/pago/registrar`,
  
  // Especialidades
  LIST_SPECIALTIES: `${BASE_URL}/especialidad/listar-basico`, // Cambiado a endpoint seguro
  LIST_SPECIALTIES_FULL: `${BASE_URL}/especialidad/listar`,  // Endpoint original (puede causar problemas)
  SAVE_SPECIALTY: `${BASE_URL}/especialidad/guardar`,
  UPDATE_SPECIALTY: `${BASE_URL}/especialidad/actualizar`,
  TOGGLE_SPECIALTY_STATUS: (id) => `${BASE_URL}/especialidad/cambiarEstado/${id}`,
  DELETE_SPECIALTY: (id) => `${BASE_URL}/especialidad/eliminar/${id}`,
};