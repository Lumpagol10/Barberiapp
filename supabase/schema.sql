-- MIGRACIÓN SAAS MULTI-INQUILINO
-- 1. Limpiar datos viejos
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS configuracion_barberia;

-- 2. Estructura de Perfiles (ya existe, pero la reforzamos)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'owner',
  authorized BOOLEAN DEFAULT TRUE -- En modo Self-service, permitimos acceso por defecto
);

-- 3. Configuración por Barbero (Tenants)
CREATE TABLE configuracion_barberia (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  nombre_barberia TEXT NOT NULL,
  telefono_barbero TEXT,
  hora_apertura TIME NOT NULL DEFAULT '09:00',
  hora_cierre TIME NOT NULL DEFAULT '20:00',
  intervalo_minutos INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Turnos vinculados al Barbero
CREATE TABLE turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbero_id UUID REFERENCES auth.users(id) NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Políticas RLS (Seguridad)
ALTER TABLE configuracion_barberia ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Configuración: Lectura pública (para la landing), edición solo por el dueño
CREATE POLICY "Lectura publica de configuracion" ON configuracion_barberia FOR SELECT TO anon USING (true);
CREATE POLICY "Edicion propia de configuracion" ON configuracion_barberia FOR ALL USING (auth.uid() = user_id);

-- Turnos: Inserción pública, lectura de sus propios turnos por el dueño
CREATE POLICY "Clientes pueden insertar turnos" ON turnos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Duenos pueden ver sus propios turnos" ON turnos FOR SELECT USING (auth.uid() = barbero_id);
