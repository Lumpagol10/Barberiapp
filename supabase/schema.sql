-- ==========================================
-- MIGRACIÓN SAAS MULTI-INQUILINO (COMPLETA)
-- ==========================================

-- 1. Estructura de Perfiles (Usuarios autorizados por Franmark Digital)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'owner',
  authorized BOOLEAN DEFAULT FALSE -- Aprobación manual requerida para entrar al dashboard
);

-- 2. Configuración por Barbero (Tenants)
CREATE TABLE IF NOT EXISTS configuracion_barberia (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  nombre_barberia TEXT NOT NULL,
  telefono_barbero TEXT,
  logo_url TEXT, -- Columna para el logo de la barbería
  google_maps_link TEXT,
  hora_apertura TIME NOT NULL DEFAULT '09:00',
  hora_cierre TIME NOT NULL DEFAULT '20:00',
  intervalo_minutos INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rutina Maestra (Horarios Semanales)
CREATE TABLE IF NOT EXISTS horarios_barberia (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  dia_semana INT NOT NULL, -- 0: Domingo, 1: Lunes...
  activo BOOLEAN DEFAULT TRUE,
  slots JSONB DEFAULT '[]', -- Array de strings ["09:00", "09:30"...]
  UNIQUE(user_id, dia_semana)
);

-- 4. Excepciones y Planificación Diaria (Strict Mode)
CREATE TABLE IF NOT EXISTS horarios_especificos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  fecha DATE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  slots JSONB DEFAULT '[]',
  UNIQUE(user_id, fecha)
);

-- 5. Turnos vinculados al Barbero
CREATE TABLE IF NOT EXISTS turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbero_id UUID REFERENCES auth.users(id) NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  precio NUMERIC DEFAULT 0,
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'completado'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Seguridad (Row Level Security - RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_barberia ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_barberia ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_especificos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Profiles
CREATE POLICY "Dueños ven su propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);

-- POLÍTICAS: Configuración
CREATE POLICY "Lectura pública de configuración" ON configuracion_barberia FOR SELECT TO anon USING (true);
CREATE POLICY "Edición propia de configuración" ON configuracion_barberia FOR ALL USING (auth.uid() = user_id);

-- POLÍTICAS: Rutina Maestra
CREATE POLICY "Lectura pública de rutina" ON horarios_barberia FOR SELECT TO anon USING (true);
CREATE POLICY "Edición propia de rutina" ON horarios_barberia FOR ALL USING (auth.uid() = user_id);

-- POLÍTICAS: Excepciones
CREATE POLICY "Lectura pública de excepciones" ON horarios_especificos FOR SELECT TO anon USING (true);
CREATE POLICY "Edición propia de excepciones" ON horarios_especificos FOR ALL USING (auth.uid() = user_id);

-- POLÍTICAS: Turnos
CREATE POLICY "Clientes pueden insertar turnos" ON turnos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Dueños pueden ver sus propios turnos" ON turnos FOR SELECT USING (auth.uid() = barbero_id);
CREATE POLICY "Dueños pueden gestionar sus propios turnos" ON turnos FOR UPDATE USING (auth.uid() = barbero_id);

-- 7. Buckets de Storage (Instrucción)
-- Nota: Asegúrate de crear manualmente el bucket 'barberia_logos' en el panel de Supabase
-- con acceso público activado.
