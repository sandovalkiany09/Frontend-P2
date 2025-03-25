document.addEventListener("DOMContentLoaded", () => {
    const usuarioId = localStorage.getItem("usuarioId");
  
    // VALIDACIÓN PIN PARA ACCEDER A LA SECCIÓN
    const accederBtn = document.getElementById("acceder-playlists-btn");
    const pinContainer = document.getElementById("pin-container-playlists");
    const pinInput = document.getElementById("pin-input-playlists");
    const confirmarPinBtn = document.getElementById("confirmar-pin-playlists");
    const opciones = document.getElementById("opciones-playlists");
  
    if (accederBtn && pinContainer && confirmarPinBtn && opciones) {
      accederBtn.addEventListener("click", () => {
        pinContainer.classList.remove("hidden");
      });
  
      confirmarPinBtn.addEventListener("click", async () => {
        const pinIngresado = pinInput.value.trim();
        if (!pinIngresado) return alert("Ingresa tu PIN");
  
        try {
          const response = await fetch("http://localhost:3000/registro/validar-pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: usuarioId, pin: String(pinIngresado) }),
          });
  
          const data = await response.json();
  
          if (response.ok && data.message === "PIN válido") {
            opciones.classList.remove("hidden");
            pinContainer.classList.add("hidden");
          } else {
            alert("PIN incorrecto");
          }
        } catch (err) {
          alert("Error al validar el PIN");
          console.error(err);
        }
      });
  
      // Botón para gestionar playlists
      const goToGestionar = document.getElementById("btn-gestionar-playlists");
      if (goToGestionar) {
        goToGestionar.addEventListener("click", () => {
          window.location.href = "gestionarPlaylists.html";
        });
      }
    }
  
    // LÓGICA DE LA PÁGINA gestionarPlaylists.html
    if (window.location.pathname.includes("gestionarPlaylists.html")) {
      const playlistsContainer = document.getElementById("playlists-container");
      const perfilesSelect = document.getElementById("perfiles");
      const btnAgregar = document.getElementById("btn-agregar");
      const formulario = document.getElementById("formulario");
      const btnGuardar = document.getElementById("guardarPlaylist");
  
      btnAgregar.addEventListener("click", () => {
        formulario.classList.toggle("hidden");    
      });
  
      async function cargarPerfiles() {
        try {
          const res = await fetch("http://localhost:3000/perfiles/obtener", {
            headers: { "usuario-id": usuarioId },
          });
          const perfiles = await res.json();
  
          perfilesSelect.innerHTML = "";
          perfiles.forEach(p => {
            const option = document.createElement("option");
            option.value = p._id;
            option.textContent = p.nombre;
            perfilesSelect.appendChild(option);
          });
        } catch (err) {
          console.error("Error cargando perfiles:", err);
        }
      }
  
      async function cargarPlaylists() {
        try {
          const res = await fetch("http://localhost:3000/playlist", {
            headers: { "usuario-id": usuarioId },
          });
          const playlists = await res.json();
  
          playlistsContainer.innerHTML = "";
          playlists.forEach(p => {
            playlistsContainer.innerHTML += `
              <div class="bg-pink-100 p-4 rounded shadow">
                <h3 class="text-lg font-semibold text-pink-700">${p.nombre}</h3>
                <p class="text-pink-500">Videos: ${p.cantidadVideos || 0}</p>
                <button onclick="window.location.href='editarPlaylist.html?id=${p._id}'" class="bg-pink-600 text-white px-4 py-1,5 rounded hover:bg-pink-700">Editar</button>
                <button onclick="eliminarPlaylist('${p._id}')" class= "bg-pink-600 text-white px-4 py-1,5 rounded hover:bg-pink-700">Eliminar</button>
              </div>
            `;
          });
        } catch (err) {
          console.error("Error cargando playlists:", err);
        }
      }
  
      btnGuardar.addEventListener("click", async () => {
        const nombre = document.getElementById("nombre").value.trim();
        const perfilesAsociados = Array.from(perfilesSelect.selectedOptions).map(o => o.value);
        if (!nombre || perfilesAsociados.length === 0) return alert("Campos obligatorios");
  
        try {
          const res = await fetch("http://localhost:3000/playlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId, nombre, perfilesAsociados }),
          });
  
          if (res.ok) {
            alert("Playlist creada");
            location.reload();
          } else {
            const data = await res.json();
            alert(data.error || "Error al crear");
          }
        } catch (err) {
          console.error("Error al guardar:", err);
        }
      });
  
      window.editarPlaylist = (id) => {
        window.location.href = `editarPlaylist.html?id=${id}`;
      };
  
      window.eliminarPlaylist = async (id) => {
        if (!confirm("¿Eliminar esta playlist?")) return;
        try {
          const res = await fetch(`http://localhost:3000/playlist/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (res.ok) {
            alert("Eliminada");
            cargarPlaylists();
          } else {
            alert(data.error || "Error al eliminar");
          }
        } catch (err) {
          console.error(err);
        }
      };
  
      cargarPerfiles();
      cargarPlaylists();
    }
  
// LÓGICA PARA editarPlaylist.html
if (window.location.pathname.includes("editarPlaylist.html")) {
  const usuarioId = localStorage.getItem("usuarioId"); 
  const id = new URLSearchParams(window.location.search).get("id");
  const nombreInput = document.getElementById("nombre");
  const perfilesSelect = document.getElementById("perfiles");
  const btnActualizar = document.getElementById("actualizarPlaylist");

  async function cargarPlaylist() {
    try {
      const res = await fetch(`http://localhost:3000/playlist/${id}`);
      const data = await res.json();

      // Establecer el nombre actual de la playlist
      nombreInput.value = data.nombre;

      // Obtener los perfiles del usuario
      const perfilesRes = await fetch("http://localhost:3000/perfiles/obtener", {
        headers: { "usuario-id": usuarioId },
      });
      const perfiles = await perfilesRes.json();

      // Limpiar y cargar las opciones
      perfilesSelect.innerHTML = "";

      // Obtener solo los IDs asociados (por si vienen como objetos)
      const idsAsociados = data.perfilesAsociados.map(p =>
        typeof p === "object" ? p._id : p
      );

      perfiles.forEach(p => {
        const option = document.createElement("option");
        option.value = p._id;
        option.textContent = p.nombre;

        // Marcar como seleccionado si está asociado
        if (idsAsociados.includes(p._id)) {
          option.selected = true;
        }

        perfilesSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Error cargando para editar", err);
    }
  }

  // Acción al hacer clic en actualizar
  btnActualizar.addEventListener("click", async () => {
    const nombre = nombreInput.value.trim();
    const perfilesAsociados = Array.from(perfilesSelect.selectedOptions).map(o => o.value);

    if (!nombre || perfilesAsociados.length === 0) {
      alert("Campos obligatorios");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/playlist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, perfilesAsociados }),
      });

      if (res.ok) {
        alert("Actualizado");
        window.location.href = "gestionarPlaylists.html";
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar");
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Cargar la información al entrar a la página
  cargarPlaylist();
}
  });
  