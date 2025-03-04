document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password = document.getElementById("password");
    const repeatPassword = document.getElementById("repeat-password");
    const fechaNacimientoInput = document.getElementById("fecha-nacimiento");
    const selectPais = document.getElementById("pais");
  
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
          option.value = pais.cca2; // Código de país (ej. "MX" para México)
          option.textContent = pais.name.common; // Nombre del país
          selectPais.appendChild(option);
        });
      } catch (error) {
        console.error('Error al cargar los países:', error);
        selectPais.innerHTML = '<option value="">Error al cargar los países</option>';
      }
    }
  
    // Llamar a la función cuando la página cargue
    cargarPaises();
  
    // Función para mostrar mensajes de error
    function mostrarError(input, mensaje) {
      let errorMensaje = input.nextElementSibling; // Buscar el siguiente elemento (mensaje de error)
      
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
  
    // Validar contraseñas en tiempo real
    repeatPassword.addEventListener("input", function () {
      if (password.value !== repeatPassword.value) {
        mostrarError(repeatPassword, "Las contraseñas no coinciden.");
      } else {
        limpiarError(repeatPassword);
      }
    });
  
    // Validar que el usuario tenga al menos 18 años
    fechaNacimientoInput.addEventListener("input", function () {
      const fechaIngresada = new Date(fechaNacimientoInput.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaIngresada.getFullYear();
      const mesDiferencia = hoy.getMonth() - fechaIngresada.getMonth();
      const diaDiferencia = hoy.getDate() - fechaIngresada.getDate();
  
      // Ajustar la edad si aún no ha pasado el cumpleaños este año
      if (mesDiferencia < 0 || (mesDiferencia === 0 && diaDiferencia < 0)) {
        edad--;
      }
  
      if (edad < 18) {
        mostrarError(fechaNacimientoInput, "Debes ser mayor de 18 años para registrarte.");
      } else {
        limpiarError(fechaNacimientoInput);
      }
    });
  
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Evitar el envío del formulario
  
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
  
      // Verificar contraseñas antes de enviar
      if (password.value !== repeatPassword.value) {
        mostrarError(repeatPassword, "Las contraseñas no coinciden.");
        valid = false;
      }
  
      // Validar edad mínima de 18 años antes de enviar el formulario
      const fechaIngresada = new Date(fechaNacimientoInput.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaIngresada.getFullYear();
      const mesDiferencia = hoy.getMonth() - fechaIngresada.getMonth();
      const diaDiferencia = hoy.getDate() - fechaIngresada.getDate();
  
      if (mesDiferencia < 0 || (mesDiferencia === 0 && diaDiferencia < 0)) {
        edad--;
      }
  
      if (edad < 18) {
        mostrarError(fechaNacimientoInput, "Debes ser mayor de 18 años para registrarte.");
        valid = false;
      }
  
      if (!valid) {
        return; // Detener si los datos no son válidos
      }
  
      // Convertir la fecha al formato correcto (DD-MM-YYYY)
      const dia = String(fechaIngresada.getDate()).padStart(2, '0');
      const mes = String(fechaIngresada.getMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0, por eso sumamos 1
      const anio = fechaIngresada.getFullYear();
  
      const fechaCorrecta = `${dia}-${mes}-${anio}`;
  
      // Si los datos son válidos, enviar los datos al backend
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
          alert("Registro exitoso");
          form.reset(); // Limpiar el formulario
        } else {
          alert(result.error || "Hubo un error en el registro");
        }
      } catch (error) {
        alert("Error al conectar con el servidor");
        console.error(error);
      }
    });
  });