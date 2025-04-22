document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const correo = document.getElementById('email').value;
    const contrasenia = document.getElementById('password').value;

    if (!correo || !contrasenia) {
      mostrarError('Por favor, completa todos los campos.');
      return;
    }

    if (!validateEmail(correo)) {
      mostrarError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/registro/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, contrasenia }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = 'inicio.html';
      } else {
        mostrarError(result.error || 'Usuario o contraseña inválida.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      mostrarError('Error al conectar con el servidor.');
    }
  });

  function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.classList.remove('hidden');
  }

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
});
