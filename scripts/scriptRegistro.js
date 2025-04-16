document.addEventListener("DOMContentLoaded", function () {
  // Elementos comunes
  const forms = document.querySelectorAll("form");
  const password = document.getElementById("password");
  const repeatPassword = document.getElementById("repeat-password");
  const fechaNacimientoInput = document.getElementById("fecha-nacimiento");
  const selectPais = document.getElementById("pais");
  
  // Elementos específicos para edición (si existen)
  const formEditar = document.getElementById("form-editar-cuenta");
  const contraseniaActual = document.getElementById("contrasenia-actual");
  const contraseniaNueva = document.getElementById("contrasenia-nueva");
  const pinActual = document.getElementById("pin-actual");
  const pinNuevo = document.getElementById("pin-nuevo");

  // Función para cargar los países desde la API
  async function cargarPaises() {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      const paises = await response.json();

      // Limpiar el mensaje de "Cargando países..."
      selectPais.innerHTML = '';

      // Ordenar los países por nombre
      paises.sort((a, b) => a.name.common.localeCompare(b.name.common));

      // Agregar cada país al select
      paises.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais.cca2;
        option.textContent = pais.name.common;
        selectPais.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar los países:', error);
      selectPais.innerHTML = '<option value="">Error al cargar los países</option>';
    }
  }

  // Función para mostrar mensajes de error
  function mostrarError(input, mensaje) {
    let errorMensaje = input.nextElementSibling;
    
    if (!errorMensaje || !errorMensaje.classList.contains("error-text")) {
      errorMensaje = document.createElement("p");
      errorMensaje.className = "error-text text-red-500 text-sm mt-1";
      input.after(errorMensaje);
    }

    errorMensaje.textContent = mensaje;
    input.classList.add("border-red-500");
  }

  // Función para limpiar errores
  function limpiarError(input) {
    let errorMensaje = input.nextElementSibling;
    if (errorMensaje && errorMensaje.classList.contains("error-text")) {
      errorMensaje.remove();
    }
    input.classList.remove("border-red-500");
  }

  // Función para validar edad (18+ años)
  function validarEdad(fechaInput) {
    const fechaIngresada = new Date(fechaInput.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaIngresada.getFullYear();
    const mesDiferencia = hoy.getMonth() - fechaIngresada.getMonth();
    const diaDiferencia = hoy.getDate() - fechaIngresada.getDate();

    if (mesDiferencia < 0 || (mesDiferencia === 0 && diaDiferencia < 0)) {
      edad--;
    }

    if (edad < 18) {
      mostrarError(fechaInput, "Debes ser mayor de 18 años.");
      return false;
    } else {
      limpiarError(fechaInput);
      return true;
    }
  }

  // Llamar a la función cuando la página cargue
  cargarPaises();

  // Validar contraseñas en tiempo real (si existen los elementos)
  if (repeatPassword && password) {
    repeatPassword.addEventListener("input", function () {
      if (password.value !== repeatPassword.value) {
        mostrarError(repeatPassword, "Las contraseñas no coinciden.");
      } else {
        limpiarError(repeatPassword);
      }
    });
  }

  // Validar edad en tiempo real (si existe el elemento)
  if (fechaNacimientoInput) {
    fechaNacimientoInput.addEventListener("input", function () {
      validarEdad(fechaNacimientoInput);
    });
  }

  // Configurar el formulario de registro si existe
  forms.forEach(form => {
    if (form.id !== "form-editar-cuenta") {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        handleRegistroSubmit(form);
      });
    }
  });

  // Configurar el formulario de edición si existe
  if (formEditar) {
    // Cargar datos del usuario al iniciar
    cargarDatosUsuario();
    
    formEditar.addEventListener("submit", async function (event) {
      event.preventDefault();
      handleEdicionSubmit();
    });
  }

  // Función para manejar el envío del formulario de registro
  async function handleRegistroSubmit() {
    let valid = true;

    // Campos obligatorios
    const campos = [
      { id: "nombre", mensaje: "El nombre es obligatorio." },
      { id: "email", mensaje: "El correo electrónico es obligatorio." },
      { id: "password", mensaje: "La contraseña es obligatoria." },
      { id: "repeat-password", mensaje: "Debes repetir la contraseña." },
      { id: "telefono", mensaje: "El número telefónico es obligatorio." },
      { id: "pin", mensaje: "El pin debe tener 6 dígitos." },
      { id: "fecha-nacimiento", mensaje: "La fecha de nacimiento es obligatoria." }
    ];

    campos.forEach(campo => {
      const input = document.getElementById(campo.id);
      if (input.value.trim() === "" || (campo.id === "pin" && input.value.length !== 6)) {
        mostrarError(input, campo.mensaje);
        valid = false;
      } else {
        limpiarError(input);
      }
    });

    // Verificar contraseñas
    if (password && repeatPassword && password.value !== repeatPassword.value) {
      mostrarError(repeatPassword, "Las contraseñas no coinciden.");
      valid = false;
    }

    // Validar edad mínima de 18 años
    if (fechaNacimientoInput && !validarEdad(fechaNacimientoInput)) {
      valid = false;
    }

    if (!valid) return;

    // Convertir la fecha al formato correcto (DD-MM-YYYY)
    const fechaIngresada = new Date(fechaNacimientoInput.value);
    const dia = String(fechaIngresada.getDate()).padStart(2, '0');
    const mes = String(fechaIngresada.getMonth() + 1).padStart(2, '0');
    const anio = fechaIngresada.getFullYear();
    const fechaCorrecta = `${dia}-${mes}-${anio}`;

    // Enviar datos al backend
    const formData = {
      correo: document.getElementById('email').value,
      contrasenia: document.getElementById('password').value,
      telefono: document.getElementById('telefono').value,
      pin: document.getElementById('pin').value,
      nombre: document.getElementById('nombre').value,
      apellidos: document.getElementById('apellidos').value,
      pais: document.getElementById('pais').value,
      fechaNacimiento: fechaCorrecta
    };

    try {
      const response = await fetch("http://localhost:3000/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        // Mostrar mensaje de éxito y redirigir
        alert("Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.");
        window.location.href = "index.html";
      } else {
        // Mostrar error específico del servidor
        alert(result.error || "Hubo un error en el registro");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Error al conectar con el servidor");
    }
  }

  // Función para cargar datos del usuario para actualizar
  async function cargarDatosUsuario() {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      alert('No se encontró información de usuario. Por favor inicia sesión nuevamente.');
      window.location.href = 'index.html';
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/registro?id=${usuarioId}`);
      if (!response.ok) throw new Error('Error al cargar datos del usuario');
      
      const usuario = await response.json();

      // Rellenar formulario con datos del usuario
      document.getElementById('nombre').value = usuario.nombre || '';
      document.getElementById('apellidos').value = usuario.apellidos || '';
      document.getElementById('correo').value = usuario.correo || '';
      document.getElementById('telefono').value = usuario.telefono || '';

      // Formatear fecha de nacimiento
      if (usuario.fechaNacimiento) {
        const fecha = new Date(usuario.fechaNacimiento);
        const fechaFormateada = fecha.toISOString().split('T')[0];
        document.getElementById('fecha-nacimiento').value = fechaFormateada;
      }

      // Establecer país del usuario
      if (usuario.pais) {
        document.getElementById('pais').value = usuario.pais;
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      alert('Error al cargar tus datos. Por favor recarga la página.');
    }
  }

  // Función para manejar el envío del formulario de edición
  async function handleEdicionSubmit() {
    let valid = true;

    // Validar campos requeridos
    const camposRequeridos = [
      { id: "nombre", mensaje: "El nombre es obligatorio." },
      { id: "apellidos", mensaje: "Los apellidos son obligatorios." },
      { id: "correo", mensaje: "El correo electrónico es obligatorio." },
      { id: "telefono", mensaje: "El teléfono es obligatorio." },
      { id: "fecha-nacimiento", mensaje: "La fecha de nacimiento es obligatoria." },
      { id: "contrasenia-actual", mensaje: "La contraseña actual es obligatoria." },
      { id: "pin-actual", mensaje: "El PIN actual es obligatorio." }
    ];

    camposRequeridos.forEach(campo => {
      const input = document.getElementById(campo.id);
      if (!input.value.trim() || (campo.id.includes("pin") && input.value.length !== 6)) {
        mostrarError(input, campo.mensaje);
        valid = false;
      } else {
        limpiarError(input);
      }
    });

    // Validar nueva contraseña si se proporciona
    if (contraseniaNueva.value && contraseniaNueva.value.length < 8) {
      mostrarError(contraseniaNueva, "La contraseña debe tener al menos 8 caracteres");
      valid = false;
    }

    // Validar nuevo PIN si se proporciona
    if (pinNuevo.value && pinNuevo.value.length !== 6) {
      mostrarError(pinNuevo, "El PIN debe tener 6 dígitos");
      valid = false;
    }

    // Validar edad
    if (!validarEdad(document.getElementById('fecha-nacimiento'))) {
      valid = false;
    }

    if (!valid) return;

    // Preparar datos para enviar
    const datosActualizados = {
      correo: document.getElementById('correo').value,
      contrasenia: document.getElementById('contrasenia-actual').value,
      contraseniaNueva: contraseniaNueva.value || undefined,
      telefono: document.getElementById('telefono').value,
      pin: document.getElementById('pin-actual').value,
      pinNuevo: pinNuevo.value || undefined,
      nombre: document.getElementById('nombre').value,
      apellidos: document.getElementById('apellidos').value,
      pais: document.getElementById('pais').value,
      fechaNacimiento: document.getElementById('fecha-nacimiento').value
    };

    // Enviar datos al backend
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      const response = await fetch(`http://localhost:3000/registro?id=${usuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizados)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Tus cambios se han guardado correctamente");
        window.location.href = 'admin.html';
      } else {
        alert(result.error || "Hubo un error al actualizar tu perfil");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
      console.error(error);
    }
  }
});