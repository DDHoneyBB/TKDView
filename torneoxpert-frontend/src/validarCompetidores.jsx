import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./validarCompetidores.css";

export default function ValidarCompetidores() {
  const [competidores, setCompetidores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [instructor, setInstructor] = useState(null);
  const navigate = useNavigate();

  // 🔹 Verificar sesión del instructor
  useEffect(() => {
    const sesion = localStorage.getItem("instructorSesion");
    if (!sesion) {
      alert("⚠️ Debes iniciar sesión como instructor para validar inscripciones.");
      navigate("/login-instructor");
    } else {
      const data = JSON.parse(sesion);
      setInstructor(data);
      setAutorizado(true);
    }
  }, [navigate]);

  // 🔹 Cargar competidores solo del instructor logueado (AHORA TODOS)
  useEffect(() => {
    if (!autorizado || !instructor) return;

    setCargando(true);
    fetch("/api/validar/competidores-instructor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escuela: instructor.escuela, instructor: instructor.nombre }),
    })
      .then((res) => res.json())
      .then((data) => {
        // data ahora incluye { id, nombre, dni, ..., estado, yaAprobado }
        setCompetidores(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando competidores:", err);
        setCargando(false);
      });
  }, [autorizado, instructor]);

  // 🔹 Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("instructorSesion");
    navigate("/login-instructor");
  };

  // 🔹 Aprobar o rechazar competidor
  const actualizarEstado = async (id, nuevoEstado) => {
    const confirmacion = window.confirm(`¿Desea marcar como ${nuevoEstado} este competidor?`);
    if (!confirmacion) return;

    try {
      const res = await fetch("/api/validar/actualizar-estado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Estado actualizado correctamente");

        // Actualizamos el estado localmente sin remover la fila para que quede deshabilitada
        setCompetidores(prev =>
          prev.map(c => {
            if (c.id === id) {
              return { ...c, estado: nuevoEstado, yaAprobado: nuevoEstado === "aprobado" ? true : c.yaAprobado };
            }
            // Si se aprobó y hay otros competidores con mismo DNI, marcarlos yaAprobado true
            if (result.aprobadoDNI && String(c.dni) === String(result.aprobadoDNI)) {
              return { ...c, yaAprobado: true };
            }
            return c;
          })
        );
      } else {
        alert(result.error || "❌ Error al actualizar estado");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión con el servidor");
    }
  };

  if (!autorizado) return null;
  if (cargando) return <p>Cargando competidores...</p>;

  return (
    <div className="validar-container">
      <div className="header-instructor">
        {instructor.logo && (
          <img src={instructor.logo} alt="Logo escuela" className="logo-escuela" />
        )}
        <h2>{instructor.nombre} ({instructor.escuela})</h2>
        <button className="btn-cerrar" onClick={cerrarSesion}>Cerrar Sesión 🔒</button>
      </div>

      <h1>Validar Inscripciones de Competidores</h1>

      {competidores.length === 0 ? (
        <p>No hay competidores registrados para este instructor.</p>
      ) : (
        <table className="tabla-validacion">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Modalidad</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {competidores.map((c) => {
              const disabled = c.yaAprobado === true || c.estado === "aprobado";
              // mostrar etiqueta si fue rechazado también
              const estadoAMostrar = c.estado || "pendiente";

              return (
                <tr key={c.id} className={disabled ? "fila-deshabilitada" : ""}>
                  <td className="col-nombre">
                    <span style={{ opacity: disabled ? 0.6 : 1 }}>{c.nombre}</span>
                    {c.yaAprobado && c.estado !== "aprobado" && (
                      <small style={{ display: "block", color: "#666" }}>
                        (DNI aprobado en otra inscripción)
                      </small>
                    )}
                  </td>
                  <td>{c.dni}</td>
                  <td>{c.modalidad}</td>
                  <td>{c.categoria}</td>
                  <td>{estadoAMostrar}</td>
                  <td>
                    <button
                      className="btn-aprobar"
                      onClick={() => actualizarEstado(c.id, "aprobado")}
                      disabled={disabled}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      className="btn-rechazar"
                      onClick={() => actualizarEstado(c.id, "rechazado")}
                      disabled={disabled}
                    >
                      ❌ Rechazar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
