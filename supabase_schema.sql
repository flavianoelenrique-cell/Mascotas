-- ============================================
-- SUPABASE SCHEMA: Mascotas Perdidas/Encontradas
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear tabla principal de mascotas
CREATE TABLE IF NOT EXISTS mascotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('perdida', 'encontrada')),
    nombre TEXT NOT NULL,
    especie TEXT NOT NULL CHECK (especie IN ('perro', 'gato', 'otro')),
    raza TEXT NOT NULL,
    color TEXT NOT NULL,
    caracteristicas TEXT,
    ubicacion TEXT NOT NULL,
    fecha DATE NOT NULL,
    imagen_url TEXT,
    contacto_nombre TEXT NOT NULL,
    contacto_telefono TEXT NOT NULL,
    contacto_email TEXT,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'resuelto')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_mascotas_tipo ON mascotas(tipo);
CREATE INDEX IF NOT EXISTS idx_mascotas_especie ON mascotas(especie);
CREATE INDEX IF NOT EXISTS idx_mascotas_estado ON mascotas(estado);
CREATE INDEX IF NOT EXISTS idx_mascotas_fecha ON mascotas(fecha DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en la tabla
ALTER TABLE mascotas ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer mascotas activas
CREATE POLICY "Lectura pública de mascotas"
ON mascotas
FOR SELECT
USING (true);

-- Política: Cualquiera puede insertar nuevas mascotas
CREATE POLICY "Inserción pública de mascotas"
ON mascotas
FOR INSERT
WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET PARA FOTOS
-- ============================================
-- Nota: Ejecuta esto en una consulta separada o
-- crea el bucket manualmente desde el panel de Storage

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('mascotas-fotos', 'mascotas-fotos', true);

-- Política de Storage: Cualquiera puede subir fotos
-- CREATE POLICY "Subida pública de fotos"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (bucket_id = 'mascotas-fotos');

-- Política de Storage: Cualquiera puede ver fotos
-- CREATE POLICY "Lectura pública de fotos"
-- ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'mascotas-fotos');
