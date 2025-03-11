document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  // Manejar el inicio de sesión
  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita que el formulario se envíe automáticamente

    // Obtener los valores de los campos
    const correo = document.getElementById('email').value;
    const contrasenia = document.getElementById('password').value;

    // Validar campos vacíos
    if (!correo || !contrasenia) {
      mostrarError('Por favor, completa todos los campos.');
      return;
    }

    // Validar formato de correo electrónico
    if (!validateEmail(correo)) {
      mostrarError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Enviar los datos al backend para autenticación
    try {
      const response = await fetch('http://localhost:3000/registro', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasenia }), 
      });

      const result = await response.json();

      if (response.ok) {
        // Guardar el usuarioId en el localStorage
      localStorage.setItem("usuarioId", result.data.id);

        // Redirigir a la pantalla de inicio si la autenticación es exitosa
        window.location.href = 'inicio.html';
      } else {
        // Mostrar mensaje de error si las credenciales son inválidas
        mostrarError(result.error || 'Usuario o contraseña inválida.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      mostrarError('Error al conectar con el servidor.');
    }
  });

  // Función para mostrar mensajes de error
  function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.classList.remove('hidden');
  }

  // Función para validar el formato de correo electrónico
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
});