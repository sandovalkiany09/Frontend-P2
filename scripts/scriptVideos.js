document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = obtenerUsuarioIdDesdeToken();
  const selectPlaylist = document.getElementById("selectPlaylist");
  const videosContainer = document.getElementById("videos-container");
  const btnAgregarVideo = document.getElementById("btn-agregar-video");
  const formVideo = document.getElementById("form-video");
  const btnGuardarVideo = document.getElementById("guardarVideo");

  const btnBuscarYoutube = document.getElementById("btnBuscarYoutube");
  const inputBusqueda = document.getElementById("busquedaYoutube");
  const youtubeResultados = document.getElementById("youtubeResultados");

  const accederBtn = document.getElementById("acceder-videos-btn");
  const pinContainer = document.getElementById("pin-container-videos");
  const pinInput = document.getElementById("pin-input-videos");
  const confirmarPinBtn = document.getElementById("confirmar-pin-video");
  const opciones = document.getElementById("opciones-videos");

  let selectedVideoId = "";
  let selectedVideoUrl = ""; 
  let players = {};

  // Mostrar el formulario del PIN cuando el botón "Acceder" es clickeado
  if (accederBtn) {
    accederBtn.addEventListener("click", () => {
      pinContainer.classList.remove("hidden"); // Muestra el contenedor para ingresar el PIN
    });
  }

  // Validar el PIN cuando se presiona el botón "Validar PIN"
  if (confirmarPinBtn) {
    confirmarPinBtn.addEventListener("click", async () => {
      const pinIngresado = pinInput.value.trim();
      if (!pinIngresado) {
        return alert("Por favor, ingresa tu PIN.");
      }

      try {
        // Enviar la solicitud para validar el PIN
        const response = await fetch("http://localhost:3000/registro/validar-pin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`  // Usar el token de localStorage
          },
          body: JSON.stringify({ id: usuarioId, pin: String(pinIngresado) })
        });

        const data = await response.json();

        // Verificar si el PIN es válido
        if (response.ok && data.message === "PIN válido") {
          opciones.classList.remove("hidden");  // Muestra las opciones para gestionar videos
          pinContainer.classList.add("hidden");  // Oculta el contenedor del PIN
          alert("PIN validado exitosamente.");
          window.location.href = "gestionarVideos.html"; // Redirigir a la página de gestión de videos
        } else {
          alert("PIN incorrecto, por favor intenta nuevamente.");
        }
      } catch (err) {
        alert("Hubo un error al validar el PIN. Intenta nuevamente.");
        console.error(err);
      }
    });
  }

  // Función para obtener el usuario ID desde el token JWT
  function obtenerUsuarioIdDesdeToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));  // Decodificar el token JWT
      return payload.id;  // Retornar el ID del usuario
    } catch (e) {
      console.error("Token inválido:", e);
      return null;
    }
  }

  // Agregar evento al botón para mostrar el formulario y la barra de búsqueda
  btnAgregarVideo.addEventListener("click", () => {
    formVideo.classList.remove("hidden"); // Mostrar el formulario
  });

  // Función para buscar videos en YouTube mientras el usuario escribe
  inputBusqueda.addEventListener("input", async () => {
    const termino = inputBusqueda.value.trim();
    if (!termino) {
      youtubeResultados.innerHTML = ""; // Limpiar resultados si el campo está vacío
      return;
    }

    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(termino)}&maxResults=6&key=AIzaSyBVPyuW3q8v33fCOeNNChr6X-8jEIUX5Os`);
      const data = await res.json();

      youtubeResultados.innerHTML = ""; // Limpiar resultados anteriores

      data.items.forEach(video => {
        const videoId = video.id.videoId;
        const titulo = video.snippet.title;
        const descripcion = video.snippet.description;
        const thumbnail = video.snippet.thumbnails.medium.url;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`; // La URL del video

        const card = document.createElement("div");
        card.className = "video-card"; // Asigna la clase 'video-card' para los estilos

        card.innerHTML = `
          <img src="${thumbnail}" alt="${titulo}" class="mb-2 w-full rounded">
          <h3 class="font-bold text-pink-700">${titulo}</h3>
          <p class="text-sm mb-2">${descripcion.slice(0, 100)}...</p>
          <button class="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 w-full"
                  data-id="${videoId}"
                  data-title="${titulo}"
                  data-description="${descripcion}"
                  data-url="${videoUrl}"> <!-- Added data-url attribute -->
            Seleccionar
          </button>
        `;

        youtubeResultados.appendChild(card);
      });

      // Evento para seleccionar un video
      document.querySelectorAll("#youtubeResultados button").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const videoId = e.target.getAttribute("data-id");
          const titulo = e.target.getAttribute("data-title");
          const descripcion = e.target.getAttribute("data-description");
          selectedVideoUrl = e.target.getAttribute("data-url"); // Capture the URL when a video is selected

          // Rellenar automáticamente los campos del formulario con la información del video seleccionado
          document.getElementById("video-nombre").value = titulo;
          document.getElementById("video-descripcion").value = descripcion;

          // Mostrar el formulario si estaba oculto
          formVideo.classList.remove("hidden");
          window.scrollTo({ top: formVideo.offsetTop, behavior: 'smooth' });
        });
      });
    } catch (err) {
      console.error("Error al buscar videos en YouTube:", err);
      alert("Error al buscar en YouTube.");
    }
  });

  // Guardar el video seleccionado en la playlist
  btnGuardarVideo.addEventListener("click", async () => {
    const nombre = document.getElementById("video-nombre").value.trim();
    const descripcion = document.getElementById("video-descripcion").value.trim();

    if (!nombre || !descripcion || !selectedVideoUrl) {
      alert("Nombre, descripción y URL del video son obligatorios.");
      return;
    }

    const videoData = {
      playlistId: selectPlaylist.value, // Asumimos que ya hay una playlist seleccionada
      nombre,
      descripcion,
      url: selectedVideoUrl // Add the selected video URL here
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
        document.getElementById("video-descripcion").value = "";
        selectedVideoUrl = ""; // Reset the URL after saving
        await cargarVideos(selectPlaylist.value);
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar video.");
      }
    } catch (err) {
      console.error("Error al guardar video:", err);
    }
  });

  async function cargarVideos(playlistId) {
    if (!playlistId) return;
  
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `
            query ObtenerVideos($playlistId: ID!) {
              videos(playlistId: $playlistId) {
                id
                nombre
                descripcion
                url
              }
            }
          `,
          variables: { playlistId }
        })
      });
  
      const result = await response.json();
      const videos = result.data?.videos || [];
  
      videosContainer.innerHTML = "";
  
      if (videos.length === 0) {
        videosContainer.innerHTML = `
          <div class="empty-state p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 class="mt-2 text-lg font-medium text-gray-900">No hay videos en esta playlist</h3>
            <p class="mt-1 text-gray-500">Agrega videos para comenzar</p>
          </div>
        `;
        return;
      }
  
      videos.forEach(v => {
        const videoId = extractVideoId(v.url);
        if (!videoId) {
          console.error(`URL de video no válida: ${v.url}`);
          return;
        }
  
        const div = document.createElement("div");
        div.className = "video-card";
        
        div.innerHTML = `
          <div class="video-container">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              class="video-iframe"
            ></iframe>
          </div>
          
          <div class="video-info">
            <h3 class="video-title">${v.nombre}</h3>
            <p class="video-description">${v.descripcion || ''}</p>
          </div>
          
          <div class="flex justify-end gap-4">
            <button onclick="window.location.href='editarVideo.html?id=${v.id}'" class="bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-700">Editar ✏️</button>
            <button onclick="eliminarVideo('${v.id}')" class="bg-pink-600 text-white px-4 py-1.5 rounded hover:bg-pink-700">Eliminar 🗑️</button>
          </div>
        `;
  
        videosContainer.appendChild(div);
      });
    } catch (error) {
      console.error("Error al cargar videos:", error);
      videosContainer.innerHTML = `
        <div class="error-state p-8 text-center bg-red-50 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-red-800">Error al cargar los videos</h3>
          <p class="mt-1 text-red-600">Intenta recargar la página</p>
        </div>
      `;
    }
  }

  function extractVideoId(url) {
    // Maneja varios formatos de URL de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
        await cargarVideos(selectPlaylist.value);
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar el video.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // Lógica para cargar las playlists al inicio
  async function cargarPlaylists() {
    const usuarioId = obtenerUsuarioIdDesdeToken();
    const query = `
      query ObtenerPlaylists($usuarioId: ID!) {
        playlists(usuarioId: $usuarioId) {
          id
          nombre
        }
      }
    `;

    try {
      const res = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, variables: { usuarioId } })
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

  selectPlaylist.addEventListener("change", (e) => {
    const playlistId = e.target.value;

    if (!playlistId) {
      // Limpiar los videos si no se ha seleccionado ninguna playlist
      videosContainer.innerHTML = ''; // Limpiar el contenedor de videos
    } else {
      cargarVideos(playlistId); // Cargar los videos después de seleccionar una playlist
    }
  });

  // Cargar playlists al cargar la página
  cargarPlaylists();
});
