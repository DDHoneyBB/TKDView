import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./form.css";

export default function LoginInstructor() {
  const [instructores, setInstructores] = useState([]);
  const [nombreSeleccionado, setNombreSeleccionado] = useState("");
  const [dni, setDni] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const volveralmenu = () => navigate("/");

  useEffect(() => {
    // 🔹 Cargar todos los instructores disponibles
    fetch("/api/escuelas/instructores")
      .then((res) => res.json())
      .then((data) => setInstructores(data))
      .catch((err) => console.error("Error cargando instructores:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!nombreSeleccionado || !dni) {
      setMensaje("⚠️ Debe seleccionar un instructor y escribir su DNI.");
      return;
    }

    try {
      const res = await fetch("/api/escuelas/login-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreSeleccionado, dni }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.error || "❌ Credenciales incorrectas");
        return;
      }

      // Guardar sesión local
localStorage.setItem(
  "instructorSesion",
  JSON.stringify({
    nombre: data.nombre,
    escuela: data.escuela,
    dni: data.dni,
    logo: data.logo,
  })
);

setMensaje(`✅ Bienvenido ${data.nombre} (${data.escuela})`);
setTimeout(() => navigate("/dashboard-instructor"), 1500);

      
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error de conexión con el servidor.");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Login Instructor</h1>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label className="form-label">Seleccione su nombre:</label>
          <select
            className="form-select"
            value={nombreSeleccionado}
            onChange={(e) => setNombreSeleccionado(e.target.value)}
            required
          >
            <option value="">-- Seleccione un instructor --</option>
            {instructores.map((inst, idx) => (
              <option key={idx} value={inst.nombre}>
                {inst.nombre} ({inst.escuela})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Ingrese su DNI:</label>
          <input
            type="password"
            className="form-control"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            placeholder="DNI"
            pattern="^[0-9]{7,8}$"
            title="Ingrese un DNI válido de 7 u 8 números"
          />
        </div>
        <button type="submit" className="btn-Instructor">
          Ingresar
        </button>

        <button type="button" className="boton-volver-menu" onClick={volveralmenu}>
           Volver al menú principal
        </button>

      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}
