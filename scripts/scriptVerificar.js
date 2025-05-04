document.getElementById('verifyBtn').addEventListener('click', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token'); // Obtener el token desde la URL

  if (token) {
    try {
      const response = await fetch(`http://localhost:3000/registro/verify/${token}`, { method: 'GET' });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Mostrar mensaje de éxito
        window.location.href = 'index.html'; //Redirigir al login
      } else {
        alert(data.error || 'Error al verificar la cuenta');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Hubo un problema al verificar la cuenta');
    }
  } else {
    alert('No se encontró el token de verificación');
  }
});