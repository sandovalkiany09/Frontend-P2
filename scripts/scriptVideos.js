document.addEventListener("DOMContentLoaded", () => {
    const usuarioId = obtenerUsuarioIdDesdeToken();

    const selectPlaylist = document.getElementById("selectPlaylist");
    const videosContainer = document.getElementById("videos-container");
    const btnAgregarVideo = document.getElementById("btn-agregar-video");
    const formVideo = document.getElementById("form-video");
    const btnGuardarVideo = document.getElementById("guardarVideo");
  
    const accederBtn = document.getElementById("acceder-videos-btn");
    const pinContainer = document.getElementById("pin-container-videos");
    const pinInput = document.getElementById("pin-input-videos");
    const confirmarPinBtn = document.getElementById("confirmar-pin-video");
    const opciones = document.getElementById("opciones-videos");

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
  
    if (accederBtn && confirmarPinBtn) {
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
            body: JSON.stringify({ id: usuarioId, pin: String(pinIngresado) })
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
  
      const goToGestionar = document.getElementById("btn-gestionar-videos");
      if (goToGestionar) {
        goToGestionar.addEventListener("click", () => {
          window.location.href = "gestionarVideos.html";
        });
      }
    }
  
    let playlistSeleccionada = null;
  
    if (btnAgregarVideo) {
      btnAgregarVideo.addEventListener("click", () => {
        if (!playlistSeleccionada) {
          alert("Debes seleccionar una playlist primero.");
          return;
        }
        formVideo.classList.toggle("hidden");
      });
    }
  
    async function cargarPlaylists() {
      try {
        const usuarioId = obtenerUsuarioIdDesdeToken(); // asegurate de tener esta función implementada
        const query = `
          query ObtenerPlaylists($usuarioId: ID!) {
            playlists(usuarioId: $usuarioId) {
              id
              nombre
            }
          }
        `;
    
        const res = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query,
            variables: { usuarioId }
          })
        });
    
        const result = await res.json();
        const playlists = result.data?.playlists || [];
    
        selectPlaylist.innerHTML = '<option value="">-- Selecciona --</option>';
        playlists.forEach(p => {
          const option = document.createElement("option");
          option.value = p.id;
          option.textContent = p.nombre;
          selectPlaylist.appendChild(option);
        });
      } catch (err) {
        console.error("Error al cargar playlists:", err);
      }
    }
  
    async function cargarVideos(playlistId) {
      const query = `
        query ObtenerVideos($playlistId: ID!) {
          videos(playlistId: $playlistId) {
            id
            nombre
            descripcion
            url
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
            variables: { playlistId }
          })
        });
    
        const result = await response.json();
    
        const videos = result.data?.videos || [];
    
        const videosContainer = document.getElementById("videos-container"); 
        videosContainer.innerHTML = "";
    
        if (videos.length === 0) {
          videosContainer.innerHTML = '<p class="text-pink-600">No hay videos aún.</p>';
          return;
        }
    
        videos.forEach(v => {
          const div = document.createElement("div");
          div.className = "relative bg-pink-100 p-4 rounded shadow flex flex-col justify-between";
    
          div.innerHTML = `
            <div>
              <h3 class="text-lg font-semibold text-pink-700">${v.nombre}</h3>
              <p class="text-sm text-pink-500 mb-2">${v.descripcion || ''}</p>
              <a href="${v.url}" target="_blank" class="text-blue-500 underline">Ver en YouTube</a>
            </div>
            <div class="flex justify-end mt-4 gap-4">
              <button onclick="window.location.href='editarVideo.html?id=${v.id}'" class="bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-700">Editar ✏️</button>
              <button onclick="eliminarVideo('${v.id}')" class="bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-700">Eliminar 🗑️</button>
            </div>
          `;
    
          videosContainer.appendChild(div);
        });
      } catch (error) {
        console.error("Error al cargar videos:", error);
      }
    }    
  
    if (btnGuardarVideo) {
      btnGuardarVideo.addEventListener("click", async () => {
        const nombre = document.getElementById("video-nombre").value.trim();
        const url = document.getElementById("video-url").value.trim();
        const descripcion = document.getElementById("video-descripcion").value.trim();
  
        if (!nombre || !url) {
          alert("Nombre y URL son obligatorios.");
          return;
        }
  
        const videoData = {
          playlistId: playlistSeleccionada,
          nombre,
          url,
          descripcion
        };
  
        try {
          const res = await fetch("http://localhost:3000/videos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(videoData)
          });
  
          if (res.ok) {
            alert("Video agregado con éxito.");
            formVideo.classList.add("hidden");
            document.getElementById("video-nombre").value = "";
            document.getElementById("video-url").value = "";
            document.getElementById("video-descripcion").value = "";
            await cargarVideos(playlistSeleccionada);
          } else {
            const data = await res.json();
            alert(data.error || "Error al guardar video.");
          }
        } catch (err) {
          console.error("Error al guardar video:", err);
        }
      });
    }
  
    if (selectPlaylist) {
      selectPlaylist.addEventListener("change", async (e) => {
        const selected = e.target.value;
        if (selected) {
          playlistSeleccionada = selected;
          await cargarVideos(selected);
        } else {
          videosContainer.innerHTML = "";
          playlistSeleccionada = null;
        }
      });
    }
  
    if (selectPlaylist) {
      cargarPlaylists();
    }
  
    // Función global para eliminar video
    window.eliminarVideo = async function (id) {
      const confirmDelete = confirm("¿Estás seguro de eliminar este video?");
      if (!confirmDelete) return;
  
      try {
        const res = await fetch(`http://localhost:3000/videos/${id}`, {
          method: "DELETE"
        });
  
        if (res.ok) {
          alert("Video eliminado.");
          await cargarVideos(playlistSeleccionada);
        } else {
          const data = await res.json();
          alert(data.error || "Error al eliminar el video.");
        }
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    };
  
    // LÓGICA PARA editarVideo.html
    if (window.location.pathname.includes("editarVideo.html")) {
      const id = new URLSearchParams(window.location.search).get("id");
  
      const nombreInput = document.getElementById("video-nombre");
      const urlInput = document.getElementById("video-url");
      const descripcionInput = document.getElementById("video-descripcion");
      const actualizarBtn = document.getElementById("actualizarVideo");
  
      // Cargar info del video
      fetch(`http://localhost:3000/videos/uno/${id}`)
        .then(res => res.json())
        .then(data => {
          nombreInput.value = data.nombre;
          urlInput.value = data.url;
          descripcionInput.value = data.descripcion || '';
        })
        .catch(err => {
          alert("Error al cargar video");
          console.error(err);
        });
  
      actualizarBtn.addEventListener("click", async () => {
        const nombre = nombreInput.value.trim();
        const url = urlInput.value.trim();
        const descripcion = descripcionInput.value.trim();
  
        if (!nombre || !url) {
          alert("Todos los campos obligatorios");
          return;
        }
  
        try {
          const res = await fetch(`http://localhost:3000/videos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, url, descripcion }),
          });
  
          if (res.ok) {
            alert("Video actualizado");
            window.location.href = "gestionarVideos.html";
          } else {
            const data = await res.json();
            alert(data.error || "Error al actualizar");
          }
        } catch (err) {
          console.error(err);
        }
      });
    }
  });
  