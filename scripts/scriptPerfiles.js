document.addEventListener("DOMContentLoaded", async function () {
    const usuarioId = localStorage.getItem("usuarioId");
    const profilesContainer = document.getElementById('profiles-container');

    try {
      // Obtener perfiles desde el backend
      const response = await fetch(`http://localhost:3000/perfiles?usuarioId=${usuarioId}`);
      const perfiles = await response.json();

      // Mostrar los perfiles en la página
      perfiles.forEach(perfil => {
        const profileCard = `
          <div class="profile-card cursor-pointer">
            <img src="${perfil.imagen}" alt="${perfil.nombre}" class="profile-image">
            <p class="mt-4 text-pink-800 font-semibold">${perfil.nombre}</p>
          </div>
        `;
        profilesContainer.innerHTML += profileCard;
      });
    } catch (error) {
      console.error('Error al cargar los perfiles:', error);
      profilesContainer.innerHTML = '<p class="text-pink-800">Error al cargar los perfiles.</p>';
    }
  });