// ================================================
// GESTIÓN DE DATOS - LocalStorage
// ================================================

const STORAGE_KEY = 'mascotas_app_data';

// Datos de ejemplo iniciales
const datosIniciales = [
  {
    id: 'pet-001',
    tipo: 'perdida',
    nombre: 'Luna',
    especie: 'perro',
    raza: 'Golden Retriever',
    color: 'Dorado',
    caracteristicas: 'Collar azul con chapita, muy cariñosa, responde a su nombre. Tiene una mancha blanca en el pecho.',
    ubicacion: 'Palermo, Buenos Aires',
    fecha: '2026-01-28',
    foto: '',
    contacto: {
      nombre: 'María García',
      telefono: '11-2345-6789',
      email: 'maria.garcia@email.com'
    },
    estado: 'activo',
    fechaCreacion: '2026-01-28T14:30:00'
  },
  {
    id: 'pet-002',
    tipo: 'encontrada',
    nombre: 'Desconocido',
    especie: 'gato',
    raza: 'Siamés',
    color: 'Crema con puntas oscuras',
    caracteristicas: 'Gato adulto, muy tranquilo. Parece estar bien cuidado. Sin collar.',
    ubicacion: 'Recoleta, Buenos Aires',
    fecha: '2026-01-30',
    foto: '',
    contacto: {
      nombre: 'Carlos López',
      telefono: '11-9876-5432',
      email: 'carlos.lopez@email.com'
    },
    estado: 'activo',
    fechaCreacion: '2026-01-30T09:15:00'
  },
  {
    id: 'pet-003',
    tipo: 'perdida',
    nombre: 'Max',
    especie: 'perro',
    raza: 'Bulldog Francés',
    color: 'Atigrado',
    caracteristicas: 'Pequeño, orejas grandes. Tiene un arnés rojo. Es muy amigable con las personas.',
    ubicacion: 'Belgrano, Buenos Aires',
    fecha: '2026-02-01',
    foto: '',
    contacto: {
      nombre: 'Ana Martínez',
      telefono: '11-5555-1234',
      email: 'ana.martinez@email.com'
    },
    estado: 'activo',
    fechaCreacion: '2026-02-01T16:45:00'
  },
  {
    id: 'pet-004',
    tipo: 'encontrada',
    nombre: 'Desconocido',
    especie: 'perro',
    raza: 'Mestizo',
    color: 'Negro con blanco',
    caracteristicas: 'Perro mediano, muy asustadizo. Tiene una cicatriz en la oreja izquierda. Parece calle.',
    ubicacion: 'Villa Crespo, Buenos Aires',
    fecha: '2026-02-02',
    foto: '',
    contacto: {
      nombre: 'Pedro Rodríguez',
      telefono: '11-4444-7890',
      email: 'pedro.rod@email.com'
    },
    estado: 'activo',
    fechaCreacion: '2026-02-02T11:20:00'
  },
  {
    id: 'pet-005',
    tipo: 'perdida',
    nombre: 'Michi',
    especie: 'gato',
    raza: 'Persa',
    color: 'Blanco',
    caracteristicas: 'Gato peludo, ojos azules. Muy mimado, no sale mucho. Tiene collar rosa con cascabel.',
    ubicacion: 'Caballito, Buenos Aires',
    fecha: '2026-02-03',
    foto: '',
    contacto: {
      nombre: 'Laura Fernández',
      telefono: '11-3333-2222',
      email: 'laura.f@email.com'
    },
    estado: 'activo',
    fechaCreacion: '2026-02-03T08:00:00'
  },
  {
    id: 'pet-006',
    tipo: 'encontrada',
    nombre: 'Firulais',
    especie: 'perro',
    raza: 'Labrador',
    color: 'Chocolate',
    caracteristicas: 'Perro grande y juguetón. Tiene collar verde con nombre pero el teléfono está borrado.',
    ubicacion: 'Núñez, Buenos Aires',
    fecha: '2026-02-01',
    foto: '',
    contacto: {
      nombre: 'Diego Sánchez',
      telefono: '11-6666-8888',
      email: 'diego.s@email.com'
    },
    estado: 'activo',
    fechaCreacion: '2026-02-01T19:30:00'
  }
];

// Clase para gestionar los datos
class DataManager {
  constructor() {
    this.initializeData();
  }

  // Inicializar datos si no existen
  initializeData() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datosIniciales));
    }
  }

  // Obtener todas las mascotas
  getAll() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Obtener mascota por ID
  getById(id) {
    const mascotas = this.getAll();
    return mascotas.find(m => m.id === id) || null;
  }

  // Agregar nueva mascota
  add(mascota) {
    const mascotas = this.getAll();
    const nuevaMascota = {
      ...mascota,
      id: this.generateId(),
      estado: 'activo',
      fechaCreacion: new Date().toISOString()
    };
    mascotas.unshift(nuevaMascota);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mascotas));
    return nuevaMascota;
  }

  // Actualizar mascota
  update(id, datos) {
    const mascotas = this.getAll();
    const index = mascotas.findIndex(m => m.id === id);
    if (index !== -1) {
      mascotas[index] = { ...mascotas[index], ...datos };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mascotas));
      return mascotas[index];
    }
    return null;
  }

  // Eliminar mascota
  delete(id) {
    const mascotas = this.getAll();
    const filtradas = mascotas.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtradas));
  }

  // Filtrar mascotas
  filter(filtros = {}) {
    let mascotas = this.getAll();

    if (filtros.tipo && filtros.tipo !== 'todas') {
      mascotas = mascotas.filter(m => m.tipo === filtros.tipo);
    }

    if (filtros.especie && filtros.especie !== 'todas') {
      mascotas = mascotas.filter(m => m.especie === filtros.especie);
    }

    if (filtros.ubicacion) {
      mascotas = mascotas.filter(m => 
        m.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      );
    }

    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase();
      mascotas = mascotas.filter(m => 
        m.nombre.toLowerCase().includes(termino) ||
        m.raza.toLowerCase().includes(termino) ||
        m.caracteristicas.toLowerCase().includes(termino) ||
        m.ubicacion.toLowerCase().includes(termino)
      );
    }

    return mascotas;
  }

  // Obtener estadísticas
  getStats() {
    const mascotas = this.getAll();
    return {
      total: mascotas.length,
      perdidas: mascotas.filter(m => m.tipo === 'perdida').length,
      encontradas: mascotas.filter(m => m.tipo === 'encontrada').length,
      resueltos: mascotas.filter(m => m.estado === 'resuelto').length
    };
  }

  // Generar ID único
  generateId() {
    return 'pet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Resetear datos a los iniciales
  reset() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datosIniciales));
  }
}

// Exportar instancia global
const dataManager = new DataManager();
