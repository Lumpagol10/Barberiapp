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

export interface FinanzasData {
  dailyTotal: number;
  monthlyTotal: number;
  annualTotal: number;
  history: Turno[];
}

export type DashboardTab = 'agenda' | 'programar' | 'finanzas' | 'config';
