// ================================================
// UTILIDADES
// ================================================

const Utils = {
    // Formatear fecha a formato legible
    formatDate(dateString) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('es-AR', options);
    },

    // Formatear fecha relativa (hace X días)
    formatRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    },

    // Obtener icono de especie
    getSpeciesIcon(especie) {
        const iconos = {
            perro: '🐕',
            gato: '🐈',
            otro: '🐾'
        };
        return iconos[especie] || '🐾';
    },

    // Obtener emoji de especie más grande
    getSpeciesEmoji(especie) {
        const emojis = {
            perro: '🐶',
            gato: '🐱',
            otro: '🐾'
        };
        return emojis[especie] || '🐾';
    },

    // Validar email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validar teléfono
    isValidPhone(phone) {
        const regex = /^[\d\s\-+()]{8,}$/;
        return regex.test(phone);
    },

    // Convertir imagen a Base64
    imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },

    // Redimensionar imagen
    resizeImage(base64, maxWidth = 800, maxHeight = 600) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = base64;
        });
    },

    // Mostrar notificación toast
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
      <span class="toast-message">${message}</span>
    `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Crear contenedor de toasts
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    // Obtener parámetro de URL
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    // Debounce para búsqueda
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generar color placeholder para imagen
    getPlaceholderColor(especie) {
        const colores = {
            perro: 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
            gato: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            otro: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
        };
        return colores[especie] || colores.otro;
    },

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Truncar texto
    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    }
};

// Agregar estilos para animación de toast
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);
