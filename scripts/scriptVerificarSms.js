document.addEventListener("DOMContentLoaded", function () {
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const errorMessage = document.createElement('p');
    errorMessage.classList.add('text-center', 'text-red-600', 'mt-2');
    document.querySelector('.bg-white').appendChild(errorMessage);
  
    // Manejo de la verificación del código SMS
    verifyCodeBtn.addEventListener('click', async function () {
      const verificationCode = document.getElementById('verification-code').value;
  
      // Validación de que se ingrese un código
      if (!verificationCode) {
        mostrarError('Por favor, ingresa el código de verificación.');
        return;
      }
  
      // Obtener el token de localStorage (asumimos que el usuario ya está autenticado)
      const token = localStorage.getItem('token');
  
      if (!token) {
        mostrarError('No se ha encontrado un token válido. Por favor, inicia sesión nuevamente.');
        return;
      }
  
      try {
        // Enviar el código al backend para verificarlo
        const response = await fetch('http://localhost:3000/registro/verify-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Enviar el token en el encabezado
          },
          body: JSON.stringify({ verificationCode }),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          // Si el código es correcto, redirigir al usuario a la página de inicio
          window.location.href = 'inicio.html'; // Redirigir a la página de inicio
        } else {
          mostrarError(result.error || 'Código de verificación incorrecto.');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        mostrarError('Error al verificar el código.');
      }
    });
  
    // Función para mostrar mensajes de error
    function mostrarError(mensaje) {
      errorMessage.textContent = mensaje;
    }
  });
  
  