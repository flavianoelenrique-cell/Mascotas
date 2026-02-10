// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
// 
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto de Supabase
// Encuentra estas credenciales en: Settings → API
//

const SUPABASE_URL = 'https://wmcsvnxontptdnlqpcre.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O6_rMvYErZdfqedznZXwSA_v7z1n1Y2';

// Inicializar cliente de Supabase
// Asegúrate de incluir el SDK en tu HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FUNCIONES PARA MASCOTAS
// ============================================

/**
 * Obtener todas las mascotas
 * @param {string} tipo - Filtrar por 'perdida' o 'encontrada' (opcional)
 * @returns {Promise<Array>} Lista de mascotas
 */
async function obtenerMascotas(tipo = null) {
    let query = supabase
        .from('mascotas')
        .select('*')
        .eq('estado', 'activo')
        .order('created_at', { ascending: false });

    if (tipo) {
        query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error al obtener mascotas:', error);
        throw error;
    }

    return data;
}

/**
 * Obtener una mascota por ID
 * @param {string} id - UUID de la mascota
 * @returns {Promise<Object>} Datos de la mascota
 */
async function obtenerMascotaPorId(id) {
    const { data, error } = await supabase
        .from('mascotas')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error al obtener mascota:', error);
        throw error;
    }

    return data;
}

/**
 * Crear nuevo reporte de mascota
 * @param {Object} mascota - Datos de la mascota
 * @returns {Promise<Object>} Mascota creada
 */
async function crearMascota(mascota) {
    const { data, error } = await supabase
        .from('mascotas')
        .insert([{
            tipo: mascota.tipo,
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza,
            color: mascota.color,
            caracteristicas: mascota.caracteristicas || null,
            ubicacion: mascota.ubicacion,
            fecha: mascota.fecha,
            imagen_url: mascota.imagen_url || null,
            contacto_nombre: mascota.contacto_nombre,
            contacto_telefono: mascota.contacto_telefono,
            contacto_email: mascota.contacto_email || null
        }])
        .select()
        .single();

    if (error) {
        console.error('Error al crear mascota:', error);
        throw error;
    }

    return data;
}

/**
 * Subir foto de mascota a Supabase Storage
 * @param {File} archivo - Archivo de imagen
 * @returns {Promise<string>} URL pública de la imagen
 */
async function subirFotoMascota(archivo) {
    const nombreArchivo = `${Date.now()}_${archivo.name.replace(/\s/g, '_')}`;

    const { data, error } = await supabase.storage
        .from('mascotas-fotos')
        .upload(nombreArchivo, archivo);

    if (error) {
        console.error('Error al subir foto:', error);
        throw error;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
        .from('mascotas-fotos')
        .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
}

/**
 * Marcar mascota como resuelta (encontrada/devuelta)
 * @param {string} id - UUID de la mascota
 * @returns {Promise<Object>} Mascota actualizada
 */
async function marcarResuelta(id) {
    const { data, error } = await supabase
        .from('mascotas')
        .update({ estado: 'resuelto' })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error al actualizar mascota:', error);
        throw error;
    }

    return data;
}

// Exportar funciones para uso en otros archivos
window.SupabaseDB = {
    obtenerMascotas,
    obtenerMascotaPorId,
    crearMascota,
    subirFotoMascota,
    marcarResuelta,
    supabase
};
