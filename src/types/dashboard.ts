export type BookingStatus = 'pendiente' | 'completado' | 'cancelado';

export interface Turno {
  id: string;
  barbero_id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha: string; // ISO date YYYY-MM-DD
  hora: string; // HH:mm:ss
  precio: number | null;
  estado: BookingStatus;
  es_manual?: boolean;
  servicio?: string;
  metodo_pago?: 'efectivo' | 'transferencia' | null;
  descripcion_servicio?: string | null;
  created_at?: string;
}

export interface ConfiguracionBarberia {
  id?: number;
  user_id: string;
  nombre_barberia: string;
  slug: string;
  telefono_barbero: string;
  logo_url: string | null;
  google_maps_link: string | null;
  hora_apertura: string; // HH:mm
  hora_cierre: string; // HH:mm
  intervalo_minutos: number;
  fidelizacion_activa: boolean;
  fidelizacion_threshold: number;
  vip_activo: boolean;
  catalogo_activo: boolean; // NUEVO: Flag para vidriera digital
  created_at?: string;
}

export interface CategoriaProducto {
  id: string;
  user_id: string;
  nombre: string;
  created_at?: string;
}

export interface Producto {
  id: string;
  user_id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  categoria_id: string | null;
  activo: boolean;
  created_at?: string;
}

export interface HorarioRutina {
  id?: number;
  user_id: string;
  dia_semana: number;
  activo: boolean;
  slots: string[];
}

export interface HorarioEspecifico {
  id?: number;
  user_id: string;
  fecha: string;
  activo: boolean;
  slots: string[];
  isNew?: boolean; // Propiedad helper para el Dashboard
}

export interface VentaProducto {
  id: string;
  user_id: string;
  nombre_producto: string;
  precio: number;
  metodo_pago: 'efectivo' | 'transferencia';
  fecha: string;
  created_at?: string;
}

export interface FinanzasData {
  dailyTotal: number;
  dailyCashTotal: number;
  dailyTransferTotal: number;
  monthlyTotal: number;
  annualTotal: number;
  history: (Turno | VentaProducto)[];
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  total_cortes: number;
  ultima_visita: string | null;
  id_barbero: string;
  created_at?: string;
}

export type DashboardTab = 'agenda' | 'programar' | 'finanzas' | 'clientes' | 'catalogo' | 'config';
