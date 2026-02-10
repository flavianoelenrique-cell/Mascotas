// ================================================
// APLICACIÓN PRINCIPAL
// ================================================

class App {
  constructor() {
    this.currentFilters = {
      tipo: 'todas',
      especie: 'todas',
      busqueda: ''
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateStats();
    this.renderPets();
    this.setupScrollHeader();
  }

  // Vincular eventos
  bindEvents() {
    // Filtros de tipo
    document.querySelectorAll('.filter-tab[data-tipo]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab[data-tipo]').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilters.tipo = e.target.dataset.tipo;
        this.renderPets();
      });
    });

    // Filtro de especie
    const especieSelect = document.getElementById('filter-especie');
    if (especieSelect) {
      especieSelect.addEventListener('change', (e) => {
        this.currentFilters.especie = e.target.value;
        this.renderPets();
      });
    }

    // Búsqueda con debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.currentFilters.busqueda = e.target.value;
        this.renderPets();
      }, 300));
    }

    // Menú móvil
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuBtn.classList.toggle('active');
      });
    }
  }

  // Header con efecto al scroll
  setupScrollHeader() {
    const header = document.querySelector('.header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }
  }

  // Actualizar estadísticas
  updateStats() {
    const stats = dataManager.getStats();

    const totalEl = document.getElementById('stat-total');
    const perdidasEl = document.getElementById('stat-perdidas');
    const encontradasEl = document.getElementById('stat-encontradas');

    if (totalEl) this.animateNumber(totalEl, stats.total);
    if (perdidasEl) this.animateNumber(perdidasEl, stats.perdidas);
    if (encontradasEl) this.animateNumber(encontradasEl, stats.encontradas);
  }

  // Animación de números
  animateNumber(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(animate);
  }

  // Renderizar mascotas
  renderPets() {
    const container = document.getElementById('pets-grid');
    const countEl = document.getElementById('pets-count');

    if (!container) return;

    const mascotas = dataManager.filter(this.currentFilters);

    if (countEl) {
      countEl.textContent = `${mascotas.length} mascota${mascotas.length !== 1 ? 's' : ''}`;
    }

    if (mascotas.length === 0) {
      container.innerHTML = this.renderEmptyState();
      return;
    }

    container.innerHTML = mascotas.map(mascota => this.renderPetCard(mascota)).join('');

    // Agregar eventos a las tarjetas
    container.querySelectorAll('.pet-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        window.location.href = `detalle.html?id=${id}`;
      });
    });
  }

  // Renderizar tarjeta de mascota
  renderPetCard(mascota) {
    const imagenHtml = mascota.foto
      ? `<img src="${mascota.foto}" alt="${Utils.escapeHtml(mascota.nombre)}">`
      : `<div class="pet-placeholder" style="background: ${Utils.getPlaceholderColor(mascota.especie)}">
           <span style="font-size: 4rem">${Utils.getSpeciesEmoji(mascota.especie)}</span>
         </div>`;

    return `
      <article class="pet-card" data-id="${mascota.id}">
        <div class="pet-card-image">
          ${imagenHtml}
          <span class="pet-card-badge badge-${mascota.tipo}">
            ${mascota.tipo === 'perdida' ? '🔍 Perdida' : '✓ Encontrada'}
          </span>
          <span class="pet-card-species">${Utils.getSpeciesIcon(mascota.especie)}</span>
        </div>
        <div class="pet-card-content">
          <h3 class="pet-card-name">${Utils.escapeHtml(mascota.nombre)}</h3>
          <p class="pet-card-breed">${Utils.escapeHtml(mascota.raza)} • ${Utils.escapeHtml(mascota.color)}</p>
          <div class="pet-card-info">
            <div class="pet-card-info-item">
              <span class="icon">📍</span>
              <span>${Utils.escapeHtml(mascota.ubicacion)}</span>
            </div>
            <div class="pet-card-info-item">
              <span class="icon">📅</span>
              <span>${Utils.formatDate(mascota.fecha)}</span>
            </div>
          </div>
          <div class="pet-card-footer">
            <span class="pet-card-date">${Utils.formatRelativeDate(mascota.fechaCreacion)}</span>
            <span class="btn btn-sm btn-secondary">Ver detalles →</span>
          </div>
        </div>
      </article>
    `;
  }

  // Estado vacío
  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="icon">🔍</div>
        <h3>No se encontraron mascotas</h3>
        <p>Intenta ajustar los filtros de búsqueda o reporta una nueva mascota.</p>
        <a href="reportar.html" class="btn btn-primary">
          <span>📝</span> Reportar mascota
        </a>
      </div>
    `;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar en la página principal
  if (document.getElementById('pets-grid')) {
    new App();
  }
});

// ================================================
// PÁGINA DE DETALLE
// ================================================

class DetailPage {
  constructor() {
    this.mascotaId = Utils.getUrlParam('id');
    if (this.mascotaId) {
      this.init();
    }
  }

  init() {
    this.mascota = dataManager.getById(this.mascotaId);

    if (!this.mascota) {
      this.renderNotFound();
      return;
    }

    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById('detail-container');
    if (!container) return;

    const imagenHtml = this.mascota.foto
      ? `<img src="${this.mascota.foto}" alt="${Utils.escapeHtml(this.mascota.nombre)}" class="detail-image">`
      : `<div class="detail-image pet-placeholder" style="background: ${Utils.getPlaceholderColor(this.mascota.especie)}; display: flex; align-items: center; justify-content: center;">
           <span style="font-size: 8rem">${Utils.getSpeciesEmoji(this.mascota.especie)}</span>
         </div>`;

    container.innerHTML = `
      <div class="detail-grid">
        <div class="detail-image-container">
          ${imagenHtml}
          <span class="detail-badge badge-${this.mascota.tipo}">
            ${this.mascota.tipo === 'perdida' ? '🔍 Perdida' : '✓ Encontrada'}
          </span>
        </div>
        
        <div class="detail-content">
          <div class="detail-header">
            <h1>${Utils.escapeHtml(this.mascota.nombre)}</h1>
            <p class="detail-breed">${Utils.escapeHtml(this.mascota.raza)} • ${Utils.getSpeciesEmoji(this.mascota.especie)}</p>
          </div>

          <div class="detail-info-grid">
            <div class="detail-info-item">
              <div class="detail-info-label">Color</div>
              <div class="detail-info-value">${Utils.escapeHtml(this.mascota.color)}</div>
            </div>
            <div class="detail-info-item">
              <div class="detail-info-label">Especie</div>
              <div class="detail-info-value">${this.mascota.especie.charAt(0).toUpperCase() + this.mascota.especie.slice(1)}</div>
            </div>
            <div class="detail-info-item">
              <div class="detail-info-label">Ubicación</div>
              <div class="detail-info-value">${Utils.escapeHtml(this.mascota.ubicacion)}</div>
            </div>
            <div class="detail-info-item">
              <div class="detail-info-label">Fecha</div>
              <div class="detail-info-value">${Utils.formatDate(this.mascota.fecha)}</div>
            </div>
          </div>

          <div class="detail-description">
            <h3>📝 Características</h3>
            <p>${Utils.escapeHtml(this.mascota.caracteristicas)}</p>
          </div>

          <div class="contact-card">
            <h3>📞 Información de Contacto</h3>
            <div class="contact-info">
              <div class="contact-info-item">
                <div class="contact-icon">👤</div>
                <div>
                  <div class="contact-label">Nombre</div>
                  <div class="contact-value">${Utils.escapeHtml(this.mascota.contacto.nombre)}</div>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="contact-icon">📱</div>
                <div>
                  <div class="contact-label">Teléfono</div>
                  <div class="contact-value">${Utils.escapeHtml(this.mascota.contacto.telefono)}</div>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="contact-icon">✉️</div>
                <div>
                  <div class="contact-label">Email</div>
                  <div class="contact-value">${Utils.escapeHtml(this.mascota.contacto.email)}</div>
                </div>
              </div>
            </div>
            <div class="contact-actions">
              <a href="tel:${this.mascota.contacto.telefono}" class="btn btn-primary">
                📞 Llamar
              </a>
              <a href="https://wa.me/${this.mascota.contacto.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(this.getWhatsAppMessage())}" 
                 class="btn btn-success" target="_blank">
                💬 WhatsApp
              </a>
            </div>
          </div>

          <div class="actions-section" style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <h4 style="margin-bottom: var(--space-md); color: var(--text-secondary);">⚙️ Acciones</h4>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
              <a href="editar.html?id=${this.mascota.id}" class="btn btn-primary btn-sm">
                ✏️ Modificar
              </a>
              <button class="btn btn-danger btn-sm" onclick="detailPage.deletePet()">
                🗑️ Eliminar
              </button>
            </div>
          </div>

          <div class="share-section" style="margin-top: var(--space-lg);">
            <h4 style="margin-bottom: var(--space-md); color: var(--text-secondary);">Compartir</h4>
            <div style="display: flex; gap: var(--space-sm);">
              <button class="btn btn-secondary btn-sm" onclick="detailPage.share('facebook')">
                📘 Facebook
              </button>
              <button class="btn btn-secondary btn-sm" onclick="detailPage.share('twitter')">
                🐦 Twitter
              </button>
              <button class="btn btn-secondary btn-sm" onclick="detailPage.share('copy')">
                📋 Copiar link
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getWhatsAppMessage() {
    const tipoMsg = this.mascota.tipo === 'perdida' ? 'perdida' : 'encontrada';
    return `Hola! Vi tu publicación sobre ${this.mascota.nombre} (${tipoMsg}) en la app de Mascotas. Me gustaría darte información.`;
  }

  share(platform) {
    const url = window.location.href;
    const text = `${this.mascota.tipo === 'perdida' ? '🔍 Mascota Perdida' : '✓ Mascota Encontrada'}: ${this.mascota.nombre} - ${this.mascota.ubicacion}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          Utils.showToast('¡Link copiado al portapapeles!', 'success');
        });
        break;
    }
  }

  deletePet() {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.')) {
      dataManager.delete(this.mascotaId);
      Utils.showToast('Publicación eliminada exitosamente', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  }

  renderNotFound() {
    const container = document.getElementById('detail-container');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">😿</div>
        <h3>Mascota no encontrada</h3>
        <p>La mascota que buscas no existe o fue eliminada.</p>
        <a href="index.html" class="btn btn-primary">
          ← Volver al inicio
        </a>
      </div>
    `;
  }

  bindEvents() {
    // Cualquier evento adicional de la página de detalle
  }
}

// Inicializar página de detalle
let detailPage;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('detail-container')) {
    detailPage = new DetailPage();
  }
});

// ================================================
// PÁGINA DE FORMULARIO
// ================================================

class FormPage {
  constructor() {
    this.tipoSeleccionado = 'perdida';
    this.imagenBase64 = '';
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Selector de tipo
    document.querySelectorAll('.type-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const selected = e.currentTarget;
        document.querySelectorAll('.type-option').forEach(o => o.classList.remove('active'));
        selected.classList.add('active');
        this.tipoSeleccionado = selected.dataset.tipo;

        // Cambiar textos según el tipo
        const fechaLabel = document.querySelector('label[for="fecha"]');
        const ubicacionLabel = document.querySelector('label[for="ubicacion"]');
        if (fechaLabel) {
          fechaLabel.textContent = this.tipoSeleccionado === 'perdida'
            ? 'Fecha en que se perdió'
            : 'Fecha en que se encontró';
        }
        if (ubicacionLabel) {
          ubicacionLabel.textContent = this.tipoSeleccionado === 'perdida'
            ? 'Última ubicación conocida'
            : 'Lugar donde se encontró';
        }
      });
    });

    // Upload de imagen
    const imageInput = document.getElementById('imagen-input');
    if (imageInput) {
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const base64 = await Utils.imageToBase64(file);
            this.imagenBase64 = await Utils.resizeImage(base64);
            this.showImagePreview(this.imagenBase64);
          } catch (error) {
            Utils.showToast('Error al cargar la imagen', 'error');
          }
        }
      });
    }

    // Envío del formulario
    const form = document.getElementById('report-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  showImagePreview(base64) {
    const uploadArea = document.querySelector('.image-upload');
    const previewContainer = document.getElementById('image-preview');

    if (uploadArea) uploadArea.style.display = 'none';

    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="image-preview">
          <img src="${base64}" alt="Preview">
          <button type="button" class="btn btn-danger btn-icon image-preview-remove" onclick="formPage.removeImage()">
            ✕
          </button>
        </div>
      `;
      previewContainer.style.display = 'block';
    }
  }

  removeImage() {
    this.imagenBase64 = '';
    const uploadArea = document.querySelector('.image-upload');
    const previewContainer = document.getElementById('image-preview');

    if (uploadArea) uploadArea.style.display = 'block';
    if (previewContainer) {
      previewContainer.innerHTML = '';
      previewContainer.style.display = 'none';
    }

    const input = document.getElementById('imagen-input');
    if (input) input.value = '';
  }

  handleSubmit(e) {
    e.preventDefault();

    // Validar formulario
    const form = e.target;
    const formData = new FormData(form);

    // Validaciones
    const nombre = formData.get('nombre')?.trim();
    const especie = formData.get('especie');
    const raza = formData.get('raza')?.trim();
    const color = formData.get('color')?.trim();
    const ubicacion = formData.get('ubicacion')?.trim();
    const fecha = formData.get('fecha');
    const caracteristicas = formData.get('caracteristicas')?.trim();
    const contactoNombre = formData.get('contacto-nombre')?.trim();
    const contactoTelefono = formData.get('contacto-telefono')?.trim();
    const contactoEmail = formData.get('contacto-email')?.trim();

    if (!nombre || !especie || !raza || !color || !ubicacion || !fecha) {
      Utils.showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (!contactoNombre || !contactoTelefono) {
      Utils.showToast('Los datos de contacto son obligatorios', 'error');
      return;
    }

    if (contactoEmail && !Utils.isValidEmail(contactoEmail)) {
      Utils.showToast('El email no es válido', 'error');
      return;
    }

    // Crear objeto de mascota
    const mascota = {
      tipo: this.tipoSeleccionado,
      nombre: nombre,
      especie: especie,
      raza: raza,
      color: color,
      caracteristicas: caracteristicas || '',
      ubicacion: ubicacion,
      fecha: fecha,
      foto: this.imagenBase64,
      contacto: {
        nombre: contactoNombre,
        telefono: contactoTelefono,
        email: contactoEmail || ''
      }
    };

    // Guardar
    const nuevaMascota = dataManager.add(mascota);

    Utils.showToast('¡Mascota publicada exitosamente!', 'success');

    // Redirigir al detalle
    setTimeout(() => {
      window.location.href = `detalle.html?id=${nuevaMascota.id}`;
    }, 1500);
  }
}

// Inicializar página de formulario
let formPage;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('report-form')) {
    formPage = new FormPage();
  }
});

// ================================================
// PÁGINA DE EDICIÓN
// ================================================

class EditPage {
  constructor() {
    this.mascotaId = Utils.getUrlParam('id');
    this.tipoSeleccionado = 'perdida';
    this.imagenBase64 = '';

    if (this.mascotaId) {
      this.init();
    } else {
      window.location.href = 'index.html';
    }
  }

  init() {
    this.mascota = dataManager.getById(this.mascotaId);

    if (!this.mascota) {
      Utils.showToast('Mascota no encontrada', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      return;
    }

    this.loadData();
    this.bindEvents();
  }

  loadData() {
    // Cargar tipo
    this.tipoSeleccionado = this.mascota.tipo;
    document.querySelectorAll('.type-option').forEach(option => {
      option.classList.remove('active');
      if (option.dataset.tipo === this.mascota.tipo) {
        option.classList.add('active');
      }
    });

    // Cargar campos de la mascota
    document.getElementById('nombre').value = this.mascota.nombre || '';
    document.getElementById('especie').value = this.mascota.especie || '';
    document.getElementById('raza').value = this.mascota.raza || '';
    document.getElementById('color').value = this.mascota.color || '';
    document.getElementById('caracteristicas').value = this.mascota.caracteristicas || '';
    document.getElementById('ubicacion').value = this.mascota.ubicacion || '';
    document.getElementById('fecha').value = this.mascota.fecha || '';

    // Cargar contacto
    document.getElementById('contacto-nombre').value = this.mascota.contacto?.nombre || '';
    document.getElementById('contacto-telefono').value = this.mascota.contacto?.telefono || '';
    document.getElementById('contacto-email').value = this.mascota.contacto?.email || '';

    // Cargar imagen
    if (this.mascota.foto) {
      this.imagenBase64 = this.mascota.foto;
      this.showImagePreview(this.mascota.foto);
    }
  }

  bindEvents() {
    // Selector de tipo
    document.querySelectorAll('.type-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const selected = e.currentTarget;
        document.querySelectorAll('.type-option').forEach(o => o.classList.remove('active'));
        selected.classList.add('active');
        this.tipoSeleccionado = selected.dataset.tipo;

        // Cambiar textos según el tipo
        const fechaLabel = document.querySelector('label[for="fecha"]');
        const ubicacionLabel = document.querySelector('label[for="ubicacion"]');
        if (fechaLabel) {
          fechaLabel.textContent = this.tipoSeleccionado === 'perdida'
            ? 'Fecha en que se perdió *'
            : 'Fecha en que se encontró *';
        }
        if (ubicacionLabel) {
          ubicacionLabel.textContent = this.tipoSeleccionado === 'perdida'
            ? 'Última ubicación conocida *'
            : 'Lugar donde se encontró *';
        }
      });
    });

    // Upload de imagen
    const imageInput = document.getElementById('imagen-input');
    if (imageInput) {
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const base64 = await Utils.imageToBase64(file);
            this.imagenBase64 = await Utils.resizeImage(base64);
            this.showImagePreview(this.imagenBase64);
          } catch (error) {
            Utils.showToast('Error al cargar la imagen', 'error');
          }
        }
      });
    }

    // Envío del formulario
    const form = document.getElementById('edit-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  showImagePreview(base64) {
    const uploadArea = document.querySelector('.image-upload');
    const previewContainer = document.getElementById('image-preview');

    if (uploadArea) uploadArea.style.display = 'none';

    if (previewContainer) {
      previewContainer.innerHTML = `
                <div class="image-preview">
                    <img src="${base64}" alt="Preview">
                    <button type="button" class="btn btn-danger btn-icon image-preview-remove" onclick="editPage.removeImage()">
                        ✕
                    </button>
                </div>
            `;
      previewContainer.style.display = 'block';
    }
  }

  removeImage() {
    this.imagenBase64 = '';
    const uploadArea = document.querySelector('.image-upload');
    const previewContainer = document.getElementById('image-preview');

    if (uploadArea) uploadArea.style.display = 'block';
    if (previewContainer) {
      previewContainer.innerHTML = '';
      previewContainer.style.display = 'none';
    }

    const input = document.getElementById('imagen-input');
    if (input) input.value = '';
  }

  handleSubmit(e) {
    e.preventDefault();

    // Validar formulario
    const form = e.target;
    const formData = new FormData(form);

    // Validaciones
    const nombre = formData.get('nombre')?.trim();
    const especie = formData.get('especie');
    const raza = formData.get('raza')?.trim();
    const color = formData.get('color')?.trim();
    const ubicacion = formData.get('ubicacion')?.trim();
    const fecha = formData.get('fecha');
    const caracteristicas = formData.get('caracteristicas')?.trim();
    const contactoNombre = formData.get('contacto-nombre')?.trim();
    const contactoTelefono = formData.get('contacto-telefono')?.trim();
    const contactoEmail = formData.get('contacto-email')?.trim();

    if (!nombre || !especie || !raza || !color || !ubicacion || !fecha) {
      Utils.showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (!contactoNombre || !contactoTelefono) {
      Utils.showToast('Los datos de contacto son obligatorios', 'error');
      return;
    }

    if (contactoEmail && !Utils.isValidEmail(contactoEmail)) {
      Utils.showToast('El email no es válido', 'error');
      return;
    }

    // Crear objeto con datos actualizados
    const datosActualizados = {
      tipo: this.tipoSeleccionado,
      nombre: nombre,
      especie: especie,
      raza: raza,
      color: color,
      caracteristicas: caracteristicas || '',
      ubicacion: ubicacion,
      fecha: fecha,
      foto: this.imagenBase64,
      contacto: {
        nombre: contactoNombre,
        telefono: contactoTelefono,
        email: contactoEmail || ''
      }
    };

    // Guardar cambios
    const mascotaActualizada = dataManager.update(this.mascotaId, datosActualizados);

    if (mascotaActualizada) {
      Utils.showToast('¡Cambios guardados exitosamente!', 'success');

      // Redirigir al detalle
      setTimeout(() => {
        window.location.href = `detalle.html?id=${this.mascotaId}`;
      }, 1500);
    } else {
      Utils.showToast('Error al guardar los cambios', 'error');
    }
  }
}

// Inicializar página de edición
let editPage;
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('edit-form')) {
    editPage = new EditPage();
  }
});
