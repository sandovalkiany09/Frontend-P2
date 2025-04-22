document.addEventListener("DOMContentLoaded", function () {
  // ==============================
  // Referencias a elementos del DOM
  // ==============================
  const forms = document.querySelectorAll("form");
  const password = document.getElementById("password");
  const repeatPassword = document.getElementById("repeat-password");
  const fechaNacimientoInput = document.getElementById("fecha-nacimiento");
  const selectPais = document.getElementById("pais");

  const formEditar = document.getElementById("form-editar-cuenta");
  const contraseniaActual = document.getElementById("contrasenia-actual");
  const contraseniaNueva = document.getElementById("contrasenia-nueva");
  const pinActual = document.getElementById("pin-actual");
  const pinNuevo = document.getElementById("pin-nuevo");

  // ==============================
  // Función para cargar países desde API externa
  // ==============================
  async function cargarPaises() {
    const selectPais = document.getElementById("pais");
  
    // Mostrar un valor por defecto mientras carga
    selectPais.innerHTML = '<option value="">Cargando países...</option>';
  
    try {
      const response = await fetch('https://restcountries.com/v3.1/all');
      
      if (!response.ok) throw new Error("No se pudo obtener la lista de países");
  
      const paises = await response.json();
  
      // Limpiar el select
      selectPais.innerHTML = '<option value="">Selecciona un país</option>';
  
      // Ordenar alfabéticamente
      paises.sort((a, b) => a.name.common.localeCompare(b.name.common));
  
      // Insertar países
      paises.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais.cca2 || pais.name.common;
        option.textContent = pais.name.common;
        selectPais.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar los países:', error);
      selectPais.innerHTML = '<option value="">Error al cargar países</option>';
    }
  }

  // ==============================
  // Funcion para sacar usuario del JWT
  // ==============================
  function obtenerUsuarioIdDesdeToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id; // usuarioId
    } catch (e) {
      console.error("Token inválido:", e);
      return null;
    }
  }
  
  

  // ==============================
  // Funciones auxiliares de validación
  // ==============================
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

  function limpiarError(input) {
    const errorMensaje = input.nextElementSibling;
    if (errorMensaje && errorMensaje.classList.contains("error-text")) {
      errorMensaje.remove();
    }
    input.classList.remove("border-red-500");
  }

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

  // ==============================
  // Validaciones en tiempo real
  // ==============================
  if (repeatPassword && password) {
    repeatPassword.addEventListener("input", function () {
      if (password.value !== repeatPassword.value) {
        mostrarError(repeatPassword, "Las contraseñas no coinciden.");
      } else {
        limpiarError(repeatPassword);
      }
    });
  }

  if (fechaNacimientoInput) {
    fechaNacimientoInput.addEventListener("input", function () {
      validarEdad(fechaNacimientoInput);
    });
  }

  // ==============================
  // Manejo del formulario de registro
  // ==============================
  forms.forEach(form => {
    if (form.id !== "form-editar-cuenta") {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        await handleRegistroSubmit();
      });
    }
  });

  async function handleRegistroSubmit() {
    let valid = true;

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
      if (!input.value.trim() || (campo.id === "pin" && input.value.length !== 6)) {
        mostrarError(input, campo.mensaje);
        valid = false;
      } else {
        limpiarError(input);
      }
    });

    if (password && repeatPassword && password.value !== repeatPassword.value) {
      mostrarError(repeatPassword, "Las contraseñas no coinciden.");
      valid = false;
    }

    if (fechaNacimientoInput && !validarEdad(fechaNacimientoInput)) {
      valid = false;
    }

    if (!valid) return;

    const fechaIngresada = new Date(fechaNacimientoInput.value);
    const dia = String(fechaIngresada.getDate()).padStart(2, '0');
    const mes = String(fechaIngresada.getMonth() + 1).padStart(2, '0');
    const anio = fechaIngresada.getFullYear();
    const fechaCorrecta = `${dia}-${mes}-${anio}`;

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registro exitoso. Inicia sesión.");
        window.location.href = "index.html";
      } else {
        alert(result.error || "Error durante el registro");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("No se pudo conectar al servidor.");
    }
  }

  // ==============================
  // Formulario de edición de usuario
  // ==============================
  if (formEditar) {
    cargarDatosUsuario();
    formEditar.addEventListener("submit", async function (event) {
      event.preventDefault();
      await handleEdicionSubmit();
    });
  }

  async function cargarDatosUsuario() {
    const usuarioId = obtenerUsuarioIdDesdeToken();
    if (!usuarioId) {
      alert("Token no válido. Inicia sesión nuevamente.");
      window.location.href = 'index.html';
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/registro/obtener", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ id: usuarioId }) 
      });
  
      if (!response.ok) throw new Error("No se pudieron cargar los datos");
  
      const usuario = await response.json();
      document.getElementById('nombre').value = usuario.nombre || '';
      document.getElementById('apellidos').value = usuario.apellidos || '';
      document.getElementById('correo').value = usuario.correo || '';
      document.getElementById('telefono').value = usuario.telefono || '';
  
      if (usuario.fechaNacimiento) {
        const fecha = new Date(usuario.fechaNacimiento);
        document.getElementById('fecha-nacimiento').value = fecha.toISOString().split('T')[0];
      }
  
      if (usuario.pais) {
        document.getElementById('pais').value = usuario.pais;
      }
    } catch (error) {
      console.error("Error al cargar el usuario:", error);
      alert("Error al cargar tus datos");
    }
  }  

  async function handleEdicionSubmit() {
    let valid = true;

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

    if (contraseniaNueva.value && contraseniaNueva.value.length < 8) {
      mostrarError(contraseniaNueva, "La contraseña debe tener al menos 8 caracteres");
      valid = false;
    }

    if (pinNuevo.value && pinNuevo.value.length !== 6) {
      mostrarError(pinNuevo, "El PIN debe tener 6 dígitos");
      valid = false;
    }

    if (!validarEdad(document.getElementById('fecha-nacimiento'))) {
      valid = false;
    }

    if (!valid) return;

    const usuarioId = obtenerUsuarioIdDesdeToken();

    const datosActualizados = {
      id: usuarioId,
      correo: document.getElementById('correo').value,
      contrasenia: contraseniaActual.value,
      contraseniaNueva: contraseniaNueva.value || undefined,
      telefono: document.getElementById('telefono').value,
      pin: pinActual.value,
      pinNuevo: pinNuevo.value || undefined,
      nombre: document.getElementById('nombre').value,
      apellidos: document.getElementById('apellidos').value,
      pais: document.getElementById('pais').value,
      fechaNacimiento: document.getElementById('fecha-nacimiento').value
    };

    try {
      const response = await fetch(`http://localhost:3000/registro`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
         },
        body: JSON.stringify(datosActualizados)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Tus cambios han sido guardados correctamente");
        window.location.href = 'admin.html';
      } else {
        alert(result.error || "Hubo un error al actualizar tu perfil");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("No se pudo conectar con el servidor.");
    }
  }

  // Inicialización
  cargarPaises();
});
