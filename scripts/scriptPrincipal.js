document.addEventListener("DOMContentLoaded", async () => {
  const perfilToken = localStorage.getItem("perfilToken");

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

  if (!perfilToken) {
    alert("No hay perfil activo.");
    window.location.href = "index.html";
    return;
  }

  let perfilId;
    try {
      const payload = JSON.parse(atob(perfilToken.split('.')[1]));
      perfilId = payload.perfilId;
    } catch (e) {
      console.error("Token de perfil inválido:", e);
      alert("Perfil no válido. Inicia sesión nuevamente.");
      window.location.href = "index.html";
      return;
    }

    try {
      const query = `
      query ObtenerPlaylistsPorPerfil($perfilId: ID!) {
        playlistsPorPerfil(perfilId: $perfilId) {
          id
          nombre
          cantidadVideos
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
        variables: { perfilId }
      })
    });

    const result = await res.json();
    const playlists = result.data?.playlistsPorPerfil || [];

    const container = document.getElementById("playlists-container");
    container.innerHTML = "";

    if (playlists.length === 0) {
      container.innerHTML = `<p class='text-pink-600'>No tienes listas de reproducción disponibles.</p>`;
      return;
    }

    playlists.forEach(playlist => {
      const div = document.createElement("div");
      div.className = "playlist-card p-4 rounded-lg shadow-md";

      div.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-pink-800">${playlist.nombre}</h3>
            <p class="text-pink-600 text-sm">${playlist.cantidadVideos} videos disponibles</p>
          </div>
          <button onclick="toggleVideos('${playlist.id}')" class="text-2xl text-pink-600 hover:text-pink-800">+</button>
        </div>
        <div id="videos-${playlist.id}" class="mt-3 hidden"></div>
      `;

      container.appendChild(div);
    });
  } catch (error) {
    console.error('Error al obtener las listas de reproducción:', error);
    alert("Error al cargar tus listas. Intenta nuevamente.");
  }
});

async function toggleVideos(playlistId) {
  const videoContainer = document.getElementById(`videos-${playlistId}`);
  if (!videoContainer.classList.contains("hidden")) {
    videoContainer.classList.add("hidden");
    videoContainer.innerHTML = "";
    return;
  }

  const query = `
    query ObtenerVideos($playlistId: ID!) {
      videosPorPlaylist(playlistId: $playlistId) {
        id
        nombre
        descripcion
        url
      }
    }
  `;

  try {
    const res = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { playlistId }
      })
    });

    const result = await res.json();
    const videos = result.data?.videosPorPlaylist || [];

    if (videos.length === 0) {
      videoContainer.innerHTML = `<p class="text-pink-600 text-sm">Esta lista no tiene videos.</p>`;
    } else {
      videoContainer.innerHTML = videos.map(video => `
        <div class="mt-2 p-2 border rounded border-pink-800">
          <h4 class="text-pink-800 font-semibold text-lg mb-1">${video.nombre}</h4>
          <p class="text-sm text-pink-600 mb-2">${video.descripcion || ''}</p>
          <a href="${video.url}" target="_blank"
             class="inline-block bg-pink-500 text-pink-600 underline px-4 py-1 rounded hover:bg-pink-600 transition">
             Ver en YouTube
          </a>
        </div>
      `).join('');
    }

    videoContainer.classList.remove("hidden");

  } catch (error) {
    console.error("Error al obtener los videos con GraphQL:", error);
  }
}

