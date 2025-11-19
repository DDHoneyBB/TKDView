import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./form.css";

export default function InscribirEquipo() {
  const [instructor, setInstructor] = useState(null);
  const [competidores, setCompetidores] = useState([]);
  const [equipoNombre, setEquipoNombre] = useState("");
  const [titulares, setTitulares] = useState([]);
  const [suplente, setSuplente] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  // 🔹 Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("instructorSesion");
    navigate("/login-instructor");
  };

  useEffect(() => {
  const sesion = localStorage.getItem("instructorSesion");
  if (!sesion) return navigate("/login-instructor");

  const inst = JSON.parse(sesion);
  setInstructor(inst);

  fetch("/api/escuelas/competidores-instructor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      escuela: inst.escuela,
      instructor: inst.nombre,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // 🔹 Filtrar duplicados por DNI
      const competidoresUnicos = Array.from(
        new Map(data.map((c) => [c.dni, c])).values()
      );
      setCompetidores(competidoresUnicos);
    })
    .catch(() => setMensaje("⚠️ Error cargando competidores"));

}, [navigate]);


  const handleSeleccionarTitular = (dni) => {
    setTitulares((prev) =>
      prev.includes(dni)
        ? prev.filter((d) => d !== dni)
        : prev.length < 5
        ? [...prev, dni]
        : prev
    );
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!equipoNombre || titulares.length !== 5 || !suplente) {
      setMensaje("⚠️ Complete todos los campos (5 titulares y 1 suplente)");
      return;
    }

    const equipoSeleccionado = {
      escuela: instructor.escuela,
      instructor: instructor.nombre,
      nombreEquipo: equipoNombre,
      titulares: competidores.filter((c) => titulares.includes(c.dni)),
      suplente: competidores.find((c) => c.dni === suplente),
    };

    try {
      const res = await fetch("/register/equipo-forma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipoSeleccionado),
      });

      const data = await res.json();
      if (!res.ok) return setMensaje(data.error || "❌ Error al guardar");

      setMensaje("✅ Equipo inscripto correctamente");
      setEquipoNombre("");
      setTitulares([]);
      setSuplente("");
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Inscripción de Equipo (Formas)</h1>

      {instructor && (
        <>
          <p><strong>Instructor:</strong> {instructor.nombre}</p>
          <p><strong>Escuela:</strong> {instructor.escuela}</p>

          <button 
            type="button" 
            className="btn btn-danger" 
            style={{ marginBottom: "15px" }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </>
       
      )}

       <button
        type="button"
        className="btn btn-secondary"
        style={{ marginBottom: "15px", marginRight: "10px" }}
        onClick={() => navigate("/validar-competidores")}
      >
        Ir a Validar Competidores
      </button>

     

      <form onSubmit={handleEnviar}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={equipoNombre}
            onChange={(e) => setEquipoNombre(e.target.value)}
            required
          />
        </div>

        <h3>Seleccionar 5 Titulares</h3>
        <div className="lista-competidores">
          {competidores.map((c) => (
            <label key={c.dni} style={{ display: "block", margin: "5px 0" }}>
              <input
                type="checkbox"
                checked={titulares.includes(c.dni)}
                onChange={() => handleSeleccionarTitular(c.dni)}
                disabled={!titulares.includes(c.dni) && titulares.length >= 5}
              />
              {c.nombre} ({c.dni}) - {c.graduacion}
            </label>
          ))}
        </div>

        <h3>Seleccionar Suplente</h3>
        <select
          value={suplente}
          onChange={(e) => setSuplente(e.target.value)}
          required
        >
          <option value="">Seleccione un suplente</option>
          {competidores
            .filter((c) => !titulares.includes(c.dni))
            .map((c) => (
              <option key={c.dni} value={c.dni}>
                {c.nombre} ({c.dni})
              </option>
            ))}
        </select>

        <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>
          Enviar equipo
        </button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}
