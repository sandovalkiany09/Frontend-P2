document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const playlistsContainer = document.getElementById('playlists-container');
    
    // Obtener solo el ID del perfil
    let perfilId = localStorage.getItem('perfilActivo');
    try {
        const perfilData = JSON.parse(perfilId);
        perfilId = perfilData?._id || perfilId;
    } catch (e) {
        // Si ya era solo el ID, lo dejamos igual
    }

    function mostrarMensaje(mensaje, esError = false) {
        playlistsContainer.innerHTML = `
            <p class="${esError ? 'text-red-600' : 'text-pink-800'} text-center py-4">
                ${mensaje}
            </p>
        `;
    }

    async function buscarVideos(terminoBusqueda) {
        try {
            if (!perfilId) {
                mostrarMensaje("No hay perfil activo seleccionado", true);
                return;
            }

            terminoBusqueda = terminoBusqueda.trim();
            if (!terminoBusqueda) {
                mostrarMensaje("Por favor, ingresa un término de búsqueda");
                return;
            }

            const url = new URL(`http://localhost:3000/buscar/perfil/${perfilId}`);
            url.searchParams.append('query', terminoBusqueda);

            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la búsqueda: ${errorText.substring(0, 100)}`);
            }

            const resultados = await response.json();
            mostrarResultados(resultados, terminoBusqueda);
        } catch (error) {
            console.error("Error completo:", error);
            mostrarMensaje("Ocurrió un error al realizar la búsqueda", true);
        }
    }

    function mostrarResultados(videos, terminoBusqueda = '') {
        playlistsContainer.innerHTML = '';

        if (!videos || videos.length === 0) {
            mostrarMensaje("No se encontraron videos que coincidan con tu búsqueda");
            return;
        }

        const terminoLower = terminoBusqueda.toLowerCase();

        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 mb-4';
            
            const nombreLimpio = video.nombre.split('&')[0].trim();

            // Resaltar coincidencias
            const nombreResaltado = nombreLimpio.replace(
                new RegExp(`(${terminoLower})`, 'ig'),
                `<span class="bg-yellow-200 font-bold">$1</span>`
            );

            videoCard.innerHTML = `
                <div class="flex flex-col">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-pink-800 mb-1">${nombreResaltado}</h3>
                        <p class="text-sm text-pink-600 mb-2">Lista: ${video.listaNombre}</p>
                        <p class="text-xs text-gray-500 mb-3">${video.descripcion?.substring(0, 100) || ''}...</p>
                    </div>
                    <div class="flex justify-end">
                        <a href="${video.url}" target="_blank"
                           class="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">
                           Ver en YouTube
                        </a>
                    </div>
                </div>
            `;

            playlistsContainer.appendChild(videoCard);
        });
    }

    // Botón buscar (opcional si el usuario prefiere usarlo)
    searchButton.addEventListener('click', () => {
        buscarVideos(searchInput.value);
    });

    // Búsqueda en vivo
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            buscarVideos(e.target.value);
        }, 300); // Espera 300ms después de escribir
    });

    // Mensaje inicial
    mostrarMensaje("Ingresa lo que deseas buscar y se mostrarán resultados automáticamente");
});
