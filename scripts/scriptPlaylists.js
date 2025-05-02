document.addEventListener("DOMContentLoaded", () => {
    const usuarioId = obtenerUsuarioIdDesdeToken();
  
    // VALIDACIÓN PIN PARA ACCEDER A LA SECCIÓN
    const accederBtn = document.getElementById("acceder-playlists-btn");
    const pinContainer = document.getElementById("pin-container-playlists");
    const pinInput = document.getElementById("pin-input-playlists");
    const confirmarPinBtn = document.getElementById("confirmar-pin-playlists");
    const opciones = document.getElementById("opciones-playlists");

    // Función para obtener perfilId desde el token JWT almacenado
    function obtenerPerfilIdDesdeToken() {
      const token = localStorage.getItem("perfilToken");
      if (!token) return null;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.perfilId; 
      } catch (error) {
        console.error("Token de perfil inválido:", error);
        return null;
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
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}` 
            },
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
        const usuarioId = obtenerUsuarioIdDesdeToken();
        if (!usuarioId) {
          console.error("No se pudo extraer el ID del usuario desde el token.");
          alert("No has iniciado sesión.");
          return;
        }
      
        const query = `
          query ObtenerPerfiles($usuarioId: ID!) {
            perfiles(usuarioId: $usuarioId) {
              id
              nombre
              imagen
            }
          }
        `;
      
        try {
          const response = await fetch("http://localhost:4000/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              query,
              variables: { usuarioId }
            })
          });
      
          const result = await response.json();
      
          if (!result.data || !result.data.perfiles) {
            throw new Error("No se pudieron obtener los perfiles");
          }
      
          const perfiles = result.data.perfiles;
          perfilesSelect.innerHTML = "";
          perfiles.forEach(p => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = p.nombre;
            perfilesSelect.appendChild(option);
          });
        } catch (err) {
          console.error("Error cargando perfiles con GraphQL:", err);
          alert("Hubo un error al cargar los perfiles.");
        }
      }     
  
      async function cargarPlaylists() {
        try {      
          const res = await fetch("http://localhost:3000/playlist", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
      
          const playlists = await res.json();
      
          playlistsContainer.innerHTML = "";
          playlists.forEach(p => {
            playlistsContainer.innerHTML += `
              <div class="bg-pink-100 p-4 rounded shadow">
                <h3 class="text-lg font-semibold text-pink-700">${p.nombre}</h3>
                <p class="text-pink-500">Videos: ${p.cantidadVideos || 0}</p>
                <button onclick="editarPlaylist('${p._id}')" class="bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-700">Editar ✏️</button>
                <button onclick="eliminarPlaylist('${p._id}')" class="bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-700">Eliminar 🗑️</button>
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
            headers: { "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
             },
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
        localStorage.setItem("playlistId", id); 
        window.location.href = "editarPlaylist.html";
      };
      
  
      window.eliminarPlaylist = async (id) => {
        if (!confirm("¿Eliminar esta playlist?")) return;
        try {
          const res = await fetch("http://localhost:3000/playlist", {
            method: "DELETE",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
           },
            body: JSON.stringify({ id }) 
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
      const usuarioId = obtenerUsuarioIdDesdeToken(); 
      const id = localStorage.getItem("playlistId");
      if (!id) {
        alert("No se encontró la playlist a editar.");
        window.location.href = "gestionarPlaylists.html";
        return;
      }

      const nombreInput = document.getElementById("nombre");
      const perfilesSelect = document.getElementById("perfiles");
      const btnActualizar = document.getElementById("actualizarPlaylist");

      async function cargarPlaylist() {
        try {
          const res = await fetch("http://localhost:3000/playlist/detalles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ id })
          });
          const data = await res.json();

          nombreInput.value = data.nombre;

          const perfilesRes = await fetch("http://localhost:3000/playlist/perfiles-asociados", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ id })
          });

          const dataPerfiles = await perfilesRes.json();
          const perfiles = dataPerfiles.perfiles;

          perfilesSelect.innerHTML = "";

          const idsAsociados = data.perfilesAsociados.map(p =>
            typeof p === "object" ? p._id : p
          );

          perfiles.forEach(p => {
            const option = document.createElement("option");
            option.value = p._id;
            option.textContent = p.nombre;

            if (idsAsociados.includes(p._id)) {
              option.selected = true;
            }

            perfilesSelect.appendChild(option);
          });
        } catch (err) {
          console.error("Error cargando para editar", err);
        }
      }

      btnActualizar.addEventListener("click", async () => {
        const nombre = nombreInput.value.trim();
        const perfilesAsociados = Array.from(perfilesSelect.selectedOptions).map(o => o.value);

        if (!nombre || perfilesAsociados.length === 0) {
          alert("Campos obligatorios");
          return;
        }

        try {
          const res = await fetch("http://localhost:3000/playlist", {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ id, nombre, perfilesAsociados })
          });

          if (res.ok) {
            alert("Actualizado");
            localStorage.removeItem("playlistId");
            window.location.href = "gestionarPlaylists.html";
          } else {
            const data = await res.json();
            alert(data.error || "Error al actualizar");
          }
        } catch (err) {
          console.error(err);
        }
      });

      cargarPlaylist();
    }

});
  