vascript
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById('complete-registration-form');
  const errorMessage = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');

  // Obtener datos de Google de la URL (si vienen por ahí)
  const urlParams = new URLSearchParams(window.location.search);
  const googleData = {
    email: urlParams.get('email'),
    name: urlParams.get('name'),
    picture: urlParams.get('picture'),
    googleId: urlParams.get('googleId')
  };

  // Rellenar datos de Google si existen
  if (googleData.email) {
    document.getElementById('user-email').textContent = googleData.email;
  }
  if (googleData.name) {
    document.getElementById('google-name').value = googleData.name;
  }
  if (googleData.picture) {
    document.getElementById('user-image').src = googleData.picture;
  }

  // Manejar envío del formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorMessage.classList.add('hidden');
    submitBtn.disabled = true;
    
    const telefono = document.getElementById('telefono').value.trim();
    const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
    const direccion = document.getElementById('direccion').value.trim();
    const pais = document.getElementById('pais').value;

    // Validación básica
    if (!telefono || !fechaNacimiento) {
      submitBtn.disabled = false;
      return mostrarError('Teléfono y fecha de nacimiento son obligatorios');
    }

    // Validar edad
    const edad = parseInt(document.getElementById('edad').value);
    if (edad < 18) {
      submitBtn.disabled = false;
      return mostrarError('Debes ser mayor de 18 años para registrarte');
    }

    try {
      const response = await fetch('http://localhost:3000/google/complete-google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...googleData, // Incluye todos los datos de Google
          telefono,
          fechaNacimiento,
          direccion,
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al completar registro');
      }

      // Redirigir a index.html como solicitaste
      window.location.href = 'index.html?registration=success';

    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message || 'Error al completar registro');
    } finally {
      submitBtn.disabled = false;
    }
  });

  function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.classList.remove('hidden');
  }

  // Calcular edad automáticamente
  document.getElementById('fecha-nacimiento').addEventListener('change', function() {
    const fechaNac = new Date(this.value);
    if (isNaN(fechaNac.getTime())) return;
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    document.getElementById('edad').value = edad;
  });
});