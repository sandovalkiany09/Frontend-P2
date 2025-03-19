document.addEventListener("DOMContentLoaded", async function () {
    const usuarioId = localStorage.getItem("usuarioId");

    // Verifica si estás en la página "Agregar Perfil"
    if (window.location.pathname.includes("agregarPerfil.html")) {
    
        // Registra el evento de clic para el botón "Agregar Perfil"
        const addProfileBtn = document.getElementById("add-profile-btn");
        if (addProfileBtn) {
            
            addProfileBtn.addEventListener("click", async function (event) {
                
                event.preventDefault();

                // Validación de campos obligatorios
                let valid = true;

                const nombre = document.getElementById("nombre").value.trim();
                const pin = document.getElementById("pin").value.trim();
                const imagenInput = document.getElementById("imagen");

                // Verificar si los campos obligatorios están vacíos
                if (!nombre) {
                    alert("El nombre es obligatorio.");
                    valid = false;
                }

                if (!pin || pin.length !== 6) {
                    alert("El PIN debe tener 6 dígitos.");
                    valid = false;
                }

                if (!imagenInput.value) {
                    alert("La imagen es obligatoria.");
                    valid = false;
                }

                if (!valid) {
                    return; // Detiene el proceso si hay algún campo inválido
                }

                // Si la validación es exitosa, valida nombre y PIN
                const isValid = await validarNombreYPin(usuarioId);
                if (isValid) {
                    await crearPerfil();
                }
            });
        } else {
            console.error("El botón 'Agregar Perfil' no fue encontrado en el DOM.");
        }
    }

    // Verifica si estás en la página "Editar Perfil"
    if (window.location.pathname.includes("editarPerfil.html")) {
        
        // Registra el evento de envío del formulario
        const formEditarPerfil = document.getElementById("form-editar-perfil");
        if (formEditarPerfil) {
            formEditarPerfil.addEventListener("submit", async function (event) {
                event.preventDefault(); // Evita que el formulario se envíe automáticamente

                // Obtén los valores del formulario
                const pinActual = document.getElementById("pin-actual").value.trim();
                const nombre = document.getElementById("nombre").value.trim();
                const pinNuevo = document.getElementById("pin-nuevo").value.trim();
                const imagen = document.getElementById("imagen").value;

                // Validación del PIN actual
                if (!pinActual || pinActual.length !== 6) {
                    alert("Por favor, ingresa un PIN actual válido de 6 dígitos.");
                    return;
                }

                // Validación del nombre
                if (!nombre) {
                    alert("El nombre es obligatorio.");
                    return;
                }

                // Validación del PIN nuevo (opcional)
                if (pinNuevo && pinNuevo.length !== 6) {
                    alert("El PIN nuevo debe tener 6 dígitos.");
                    return;
                }

                // Actualizar el perfil
                try {
                    const response = await fetch("http://localhost:3000/perfiles/actualizar", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            usuarioId: usuarioId,
                            pinActual: pinActual,
                            nombre: nombre,
                            pinNuevo: pinNuevo,
                            imagen: imagen
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert("Perfil actualizado exitosamente.");
                        window.location.href = "editarPerfil.html";  
                    } else {
                        alert(data.error || "Error al actualizar el perfil.");
                    }
                } catch (error) {
                    console.error("Error al actualizar el perfil:", error);
                    alert("Hubo un error al actualizar el perfil.");
                }
            });
        } else {
            console.error("El formulario de editar perfil no fue encontrado en el DOM.");
        }
    }

    // Verifica si estás en la página "Eliminar Perfil"
    if (window.location.pathname.includes("eliminarPerfil.html")) {
        console.log("Estás en la página de Eliminar Perfil"); // Verifica que este mensaje aparezca

        // Registra el evento de envío del formulario
        const formEliminarPerfil = document.getElementById("form-eliminar-perfil");
        if (formEliminarPerfil) {
        formEliminarPerfil.addEventListener("submit", async function (event) {
            event.preventDefault(); // Evita que el formulario se envíe automáticamente

            // Obtén los valores del formulario
            const pin = document.getElementById("pin").value.trim();

            // Validación del PIN
            if (!pin || pin.length !== 6) {
            alert("Por favor, ingresa un PIN válido de 6 dígitos.");
            return;
            }

            // Enviar la solicitud de eliminación al servidor
            try {
            const response = await fetch("http://localhost:3000/perfiles/eliminar", {
                method: "DELETE",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                usuarioId: usuarioId,
                pin: pin,
                }),
            });

            // Verifica si la respuesta es JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Respuesta del servidor no es JSON:", text);
                throw new Error("Respuesta del servidor no es JSON");
            }

            const data = await response.json();

            if (response.ok) {
                alert("Perfil eliminado exitosamente.");
                window.location.href = "eliminarPerfil.html"; // Redirige al administrador
            } else {
                alert(data.error || "Error al eliminar el perfil.");
            }
            } catch (error) {
            console.error("Error al eliminar el perfil:", error);
            alert("Hubo un error al eliminar el perfil.");
            }
        });
        } else {
        console.error("El formulario de eliminar perfil no fue encontrado en el DOM.");
        }
    }
    
    // Verificar si estamos en la página de inicio para mostrar perfiles
    if (window.location.pathname.includes("inicio.html")) {
        const profilesContainer = document.getElementById("profiles-container");

        // Función para cargar los perfiles del usuario
        async function cargarPerfiles() {
        try {
            // Hacer una solicitud GET al backend para obtener los perfiles
            const response = await fetch("http://localhost:3000/perfiles/obtener", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "usuario-id": usuarioId, 
            },
            });

            // Verifica si la respuesta es JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Respuesta del servidor no es JSON:", text);
            throw new Error("Respuesta del servidor no es JSON");
            }

            const perfiles = await response.json();

            // Limpiar el contenedor de perfiles
            profilesContainer.innerHTML = "";

            // Mostrar cada perfil en el contenedor
            perfiles.forEach((perfil) => {
            const profileCard = `
                <div class="profile-card cursor-pointer">
                <img src="${perfil.imagen}" alt="${perfil.nombre}" class="profile-image">
                <p class="mt-4 text-pink-800 font-semibold">${perfil.nombre}</p>
                </div>
            `;
            profilesContainer.innerHTML += profileCard;
            });
        } catch (error) {
            console.error("Error al cargar los perfiles:", error);
            profilesContainer.innerHTML = '<p class="text-pink-800">Error al cargar los perfiles.</p>';
        }
        }

        // Cargar los perfiles al iniciar la página
        cargarPerfiles();
    }

    const accederBtn = document.getElementById("acceder-btn");
    const pinContainer = document.getElementById("pin-container");
    const pinInput = document.getElementById("pin-input");
    const confirmarPinBtn = document.getElementById("confirmar-pin-btn");
    const opcionesAdmin = document.getElementById("opciones-admin");

    if (!pinContainer || !accederBtn || !confirmarPinBtn || !opcionesAdmin) {
        console.error("Faltan elementos en el DOM.");
        return;
    }


    // Mostrar input para el PIN al hacer clic en "Acceder"
    accederBtn.addEventListener("click", function () {
        pinContainer.style.display = "block";
    });

    // Validar el PIN al hacer clic en "Confirmar"
    confirmarPinBtn.addEventListener("click", async function () {
        const pinIngresado = pinInput.value.trim();

        if (!pinIngresado) {
            alert("Por favor, ingrese un PIN.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/registro/validar-pin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: usuarioId,
                    pin: String(pinIngresado)
                })
            });

            const data = await response.json();

            if (response.ok && data.message === "PIN válido") {
                if (opcionesAdmin) opcionesAdmin.style.display = "block";
                if (pinContainer) pinContainer.style.display = "none";
            } else {
                alert(data.message || "PIN incorrecto.");
            }
        } catch (error) {
            console.error("Error al validar el PIN:", error);
            alert("Hubo un error al validar el PIN.");
        }
    });

    // Función para validar si el nombre y el PIN ya existen
    async function validarNombreYPin(usuarioId) {
        const nombre = document.getElementById("nombre").value.trim();
        const pin = document.getElementById("pin").value.trim();
    
        if (!nombre || !pin || pin.length !== 6) {
            alert("Por favor, ingrese un nombre y un PIN de 6 dígitos.");
            return false;
        }
    
        try {
            const response = await fetch("http://localhost:3000/perfiles/validar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuarioId: usuarioId, 
                    nombre: nombre,        
                    pin: String(pin)      
                })
            });
    
            const data = await response.json();
    
            if (data.exists) {
                alert("El PIN o el nombre ya existen.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al validar el nombre o PIN:", error);
            alert("Hubo un error al validar el nombre o PIN.");
            return false;
        }
    }

    // Función para crear el perfil
    async function crearPerfil() {
        const nombre = document.getElementById("nombre").value.trim();
        const pin = document.getElementById("pin").value.trim();
        const imagen = document.getElementById("imagen").value;

        const perfil = {
            usuarioId: usuarioId,
            nombre: nombre,
            pin: pin,
            imagen: imagen
        };

        try {
            const response = await fetch("http://localhost:3000/perfiles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(perfil)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Perfil agregado exitosamente.");
                window.location.href = "agregarPerfil.html";  // Redirige al administrador
            } else {
                alert(data.message || "Error al agregar el perfil.");
            }
        } catch (error) {
            console.error("Error al crear el perfil:", error);
            alert("Hubo un error al crear el perfil.");
        }
    }

    // Event listeners para los botones de administración
    document.getElementById("add-profile").addEventListener("click", function () {
        window.location.href = "agregarPerfil.html";
    });

    document.getElementById("edit-profile").addEventListener("click", function () {
        window.location.href = "editarPerfil.html"; 
    });

    document.getElementById("delete-profile").addEventListener("click", function () {
        window.location.href = "eliminarPerfil.html"; 
    });
});

