export function obtenerUsuarioIdDesdeToken() {
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
  