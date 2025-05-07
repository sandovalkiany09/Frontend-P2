document.addEventListener("DOMContentLoaded", async function () {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  // Función para mostrar errores
  function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.classList.remove('hidden');
  }

  // Función para validar email
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Inicio de sesión con formulario tradicional
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
        window.location.href = 'verificarSms.html';
      } else {
        mostrarError(result.error || 'Usuario o contraseña inválida.');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      mostrarError('Error al conectar con el servidor.');
    }
  });

// Configuración mejorada de Google Sign-In
async function initGoogleAuth() {
  try {
    // 1. Cargar API de Google
    await loadGoogleAPI();
    
    // 2. Verificar que la API se cargó correctamente
    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services no se cargó correctamente');
    }

    // 3. Configuración del botón
    google.accounts.id.initialize({
      client_id: '935191010225-sb3dohqka23fhi4rn0iuien2gu4cftd9.apps.googleusercontent.com',
      callback: handleGoogleResponse,
      ux_mode: 'popup',
      context: 'signin'
    });

    // 4. Renderizar botón
    google.accounts.id.renderButton(
      document.getElementById('google-sign-in'),
      {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 300,
        logo_alignment: 'left'
      }
    );

    // 5. Opcional: Mostrar One Tap
    google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkipped()) {
        console.log('One Tap no mostrado');
      }
    });

  } catch (error) {
    console.error('Error en Google Auth:', error);
    mostrarError('Error al cargar autenticación con Google');
    // Fallback: Mostrar botón manual
    showManualGoogleButton();
  }
}

// Manejar respuesta de Google
async function handleGoogleResponse(response) {
  try {
    mostrarError(''); // Limpiar errores anteriores
    
    const res = await fetch('http://localhost:3000/registro/auth/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });

    // Verificar si la respuesta es JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'Respuesta no válida del servidor');
    }

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Error en autenticación');
    }
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // Redirigir según el estado de registro
      if (data.registroCompleto) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'registroGoogle.html';
      }
    } else {
      throw new Error('No se recibió token del servidor');
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al iniciar sesión con Google';
    
    if (error.message.includes('ValidationError')) {
      errorMessage = 'Error en los datos del usuario';
    } else if (error.message.includes('404')) {
      errorMessage = 'Servicio no disponible. Por favor intenta más tarde';
    }
    
    mostrarError(errorMessage);
  }
}

// Función de carga de la API
function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Error al cargar Google API'));
    document.head.appendChild(script);
  });
}

// Botón manual de fallback
function showManualGoogleButton() {
  const googleBtn = document.getElementById('google-sign-in');
  googleBtn.innerHTML = `
    <button onclick="window.location.href='/auth/google'" 
            class="flex items-center justify-center w-full gap-2 px-4 py-2 border rounded-lg">
      <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
           class="w-5 h-5">
      Continuar con Google
    </button>
  `;
}

// Inicializar
initGoogleAuth();
});