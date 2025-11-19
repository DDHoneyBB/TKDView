import React, { useEffect, useState } from "react";
import "./Equipos.css";
import { useNavigate } from "react-router-dom";

export default function ListaEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [equipoAbierto, setEquipoAbierto] = useState(null);
  const navigate = useNavigate();
  const volverAlMenu = () => navigate("/");
  useEffect(() => {
    fetch("/api/equipos")
      .then((res) => res.json())
      .then((data) => setEquipos(data))
      .catch(() => setMensaje("⚠️ Error cargando equipos"));
  }, []);

  const toggleEquipo = (id) => {
    setEquipoAbierto(equipoAbierto === id ? null : id);
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Equipos Inscritos</h1>

      {mensaje && <p>{mensaje}</p>}

      {equipos.length === 0 ? (
        <p>No hay equipos registrados aún.</p>
      ) : (
        <div className="equipos-grid">
          {equipos.map((eq) => (
            <div 
              key={eq.id} 
              className={`equipo-card ${equipoAbierto === eq.id ? 'abierto' : ''}`}
              onClick={() => toggleEquipo(eq.id)}
            >
              <div className="equipo-indicador"></div>
              
              <h3>{eq.nombreEquipo}</h3>
              
              <div className="equipo-info-basica">
                <p><strong>Escuela:</strong> {eq.escuela}</p>
                <p><strong>Instructor:</strong> {eq.instructor}</p>
              </div>

              <div className="equipo-contenido">
                <div className="equipo-seccion">
                  <h4>Titulares</h4>
                  <ul className="titulares-lista">
                    {eq.titulares.map((t) => (
                      <li key={t.dni}>
                        {t.nombre} ({t.dni}) - {t.graduacion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="equipo-seccion">
                  <h4>Suplente</h4>
                  <div className="suplente-info">
                    {eq.suplente?.nombre ? (
                      <p>{eq.suplente.nombre} ({eq.suplente.dni})</p>
                    ) : (
                      <p>No asignado</p>
                    )}
                  </div>
                </div>

                <p className="equipo-fecha">
                  Inscripto el {new Date(eq.fecha).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
        <div className="botones-container">
          <button className="btn-volver" onClick={volverAlMenu}>Volver al menú</button>
        </div>
    </div>
  );
}