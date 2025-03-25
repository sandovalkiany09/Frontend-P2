document.addEventListener("DOMContentLoaded", () => {
  const perfil = JSON.parse(localStorage.getItem("perfilActivo"));
  if (!perfil) {
    alert("No hay perfil activo.");
    window.location.href = "index.html";
    return;
  }

  fetch(`http://localhost:3000/playlist/perfil/${perfil._id}`)
    .then(res => res.json())
    .then(playlists => {
      const container = document.getElementById("playlists-container");
      container.innerHTML = "";

      if (playlists.length === 0) {
        container.innerHTML = `<p class='text-pink-600'>No tienes listas de reproducción disponibles.</p>`;
        return;
      }

      playlists.forEach(playlist => {
        // Obtener el conteo de videos por playlist
        fetch(`http://localhost:3000/videos/conteo/${playlist._id}`)
          .then(res => res.json())
          .then(data => {
            const div = document.createElement("div");
            div.className = "playlist-card p-4 rounded-lg shadow-md";

            div.innerHTML = `
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-pink-800">${playlist.nombre}</h3>
                  <p class="text-pink-600 text-sm">${data.total} videos disponibles</p>
                </div>
                <button onclick="toggleVideos('${playlist._id}')" class="text-2xl text-pink-600 hover:text-pink-800">+</button>
              </div>
              <div id="videos-${playlist._id}" class="mt-3 hidden"></div>
            `;

            container.appendChild(div);
          })
          .catch(error => {
            console.error('Error al contar videos:', error);
          });
      });
    })
    .catch(error => {
      console.error('Error al obtener las listas de reproducción:', error);
    });
});

function toggleVideos(playlistId) {
  const videoContainer = document.getElementById(`videos-${playlistId}`);
  if (!videoContainer.classList.contains("hidden")) {
    videoContainer.classList.add("hidden");
    videoContainer.innerHTML = "";
    return;
  }

  fetch(`http://localhost:3000/videos/${playlistId}`)
    .then(res => res.json())
    .then(videos => {
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
    })
    .catch(error => {
      console.error('Error al obtener los videos:', error);
    });
}
