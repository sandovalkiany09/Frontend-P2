document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const searchInput = document.querySelector('input[type="text"]');
    const searchButton = document.querySelector('button');
    const playlistsContainer = document.getElementById('playlists-container');
    const usuarioId = localStorage.getItem('usuarioId'); // Obtener el usuarioId del localStorage

    // Función para buscar videos
    async function buscarVideos(terminoBusqueda) {
        try {
            // Obtener las listas de reproducción del usuario
            const response = await fetch(`http://localhost:3000/api/listas-reproduccion?usuarioId=${usuarioId}`);
            const listasReproduccion = await response.json();

            // Filtrar videos que coincidan con el término de búsqueda
            const resultados = [];
            
            listasReproduccion.forEach(lista => {
                lista.videos.forEach(video => {
                    if (video.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) || 
                        video.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase())) {
                        resultados.push({
                            ...video,
                            listaNombre: lista.nombre
                        });
                    }
                });
            });

            // Mostrar resultados
            mostrarResultados(resultados);
        } catch (error) {
            console.error("Error al buscar videos:", error);
            playlistsContainer.innerHTML = '<p class="text-pink-800">Error al cargar los resultados de búsqueda.</p>';
        }
    }

    // Función para mostrar los resultados de búsqueda
    function mostrarResultados(videos) {
        playlistsContainer.innerHTML = '';

        if (videos.length === 0) {
            playlistsContainer.innerHTML = '<p class="text-pink-800">No se encontraron videos que coincidan con tu búsqueda.</p>';
            return;
        }

        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer';
            videoCard.innerHTML = `
                <div class="flex items-start">
                    <img src="${video.miniatura}" alt="${video.nombre}" class="w-32 h-20 object-cover rounded-lg mr-4">
                    <div>
                        <h3 class="text-lg font-semibold text-pink-800">${video.nombre}</h3>
                        <p class="text-sm text-pink-600">${video.listaNombre}</p>
                        <p class="text-xs text-gray-500 mt-1">${video.descripcion.substring(0, 100)}...</p>
                    </div>
                </div>
            `;
            
            // Agregar evento click para reproducir el video
            videoCard.addEventListener('click', () => {
                window.location.href = `reproducir.html?videoId=${video.id}`;
            });

            playlistsContainer.appendChild(videoCard);
        });
    }

    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', () => {
        const terminoBusqueda = searchInput.value.trim();
        if (terminoBusqueda) {
            buscarVideos(terminoBusqueda);
        }
    });

    // Evento para la tecla Enter en el input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const terminoBusqueda = searchInput.value.trim();
            if (terminoBusqueda) {
                buscarVideos(terminoBusqueda);
            }
        }
    });
});