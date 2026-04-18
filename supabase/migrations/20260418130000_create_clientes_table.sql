-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    total_cortes INTEGER DEFAULT 0,
    ultima_visita TIMESTAMPTZ,
    id_barbero UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(id_barbero, telefono)
);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Barberos pueden ver sus propios clientes"
ON clientes FOR SELECT
TO authenticated
USING (auth.uid() = id_barbero);

CREATE POLICY "Barberos pueden insertar sus propios clientes"
ON clientes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id_barbero);

CREATE POLICY "Barberos pueden actualizar sus propios clientes"
ON clientes FOR UPDATE
TO authenticated
USING (auth.uid() = id_barbero)
WITH CHECK (auth.uid() = id_barbero);

CREATE POLICY "Barberos pueden eliminar sus propios clientes"
ON clientes FOR DELETE
TO authenticated
USING (auth.uid() = id_barbero);
