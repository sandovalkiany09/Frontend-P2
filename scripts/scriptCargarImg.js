
document.addEventListener("DOMContentLoaded", function() {
    obtenerYMostrarImagenes();  // Llamada a tu función cuando el DOM esté listo
});

// Función para obtener y mostrar imágenes almacenadas en el backend
function obtenerYMostrarImagenes() {
    const imagenesContainer = document.getElementById('imagenes-container');
    const imagenInput = document.getElementById('imagen'); // Input oculto para almacenar la selección

    const nombresImagenes = [
        "img0.jpg", "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg", "img7.jpg",
        "img8.jpg", "img9.jpg", "img10.jpg", "img11.jpg", "img12.jpg", "img13.jpg", "img14.jpg", "img15.jpg",
        "img16.jpg", "img17.jpg", "img18.jpg", "img19.jpg", "img20.jpg"
    ];

    imagenesContainer.innerHTML = ""; // Limpiar contenedor antes de agregar imágenes

    nombresImagenes.forEach(nombre => {
        const img = document.createElement('img');
        img.src = `http://localhost:3000/img/${nombre}`; // Ruta de la imagen en el servidor
        img.classList.add('w-20', 'h-20', 'cursor-pointer', 'rounded-lg'); // Sin borde por defecto

        img.onclick = () => {
            imagenInput.value = `http://localhost:3000/img/${nombre}`; // Guardar la ruta en el input oculto
            resaltarImagenSeleccionada(img);
        };

        imagenesContainer.appendChild(img);
    });
}

// Función para resaltar la imagen seleccionada cambiando la opacidad
function resaltarImagenSeleccionada(imgSeleccionada) {
    document.querySelectorAll('#imagenes-container img').forEach(img => {
        img.style.opacity = 1;  // Restaurar opacidad a todas las imágenes
    });
    imgSeleccionada.style.opacity = 0.4;  // Reducir opacidad de la imagen seleccionada
}
