import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SalaControles.css";

function SalaControles() {
  const [controles, setControles] = useState([]);
  const [filtroTatami, setFiltroTatami] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar controles desde el backend
  const cargarControles = async () => {
    try {
      setCargando(true);
      setError(null);
      console.log('🔄 Cargando controles desde backend...');
      
      const response = await fetch("/api/controles/todos");
      console.log('📡 Respuesta recibida:', response.status);
      
      const data = await response.json();
      console.log('📄 Datos recibidos:', data);
      
      if (data.success) {
        setControles(data.controles);
        console.log("✅ Controles cargados:", data.controles.length);
      } else {
        setError(data.error);
        console.error("❌ Error en respuesta:", data.error);
      }
    } catch (error) {
      setError("Error de conexión: " + error.message);
      console.error("❌ Error de conexión cargando controles:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarControles();
  }, []);

  const copiarEnlace = (url) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`)
      .then(() => {
        alert("Enlace copiado al portapapeles");
      })
      .catch(err => {
        console.error("Error al copiar: ", err);
      });
  };

  const controlesFiltrados = filtroTatami 
    ? controles.filter(control => control.tatamiId.includes(filtroTatami))
    : controles;

  const tatamisUnicos = [...new Set(controles.map(control => control.tatamiId))];

  if (cargando) {
    return (
      <div className="sala-controles">
        <div className="cargando">🔄 Cargando controles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sala-controles">
        <div className="error">
          <p>❌ Error: {error}</p>
          <button onClick={cargarControles}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sala-controles">
      <div className="sala-header">
        <h1>🎮 Sala de Controles Centralizada</h1>
        <div>
          <button onClick={cargarControles} className="btn-actualizar">
            🔄 Actualizar
          </button>
          <button onClick={() => navigate("/dashboard")} className="btn-volver">
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="filtros-panel">
        <div className="estadisticas">
          <span>Total: {controles.length} controles</span>
          <span>Tatamis: {tatamisUnicos.length}</span>
          <span>Última actualización: {new Date().toLocaleTimeString()}</span>
        </div>
        
        <div className="filtro-tatami">
          <input
            type="text"
            placeholder="Filtrar por tatami..."
            value={filtroTatami}
            onChange={(e) => setFiltroTatami(e.target.value)}
          />
        </div>
      </div>

      <div className="controles-grid">
        {controlesFiltrados.length === 0 ? (
          <div className="no-controles">
            <p>No hay controles {filtroTatami ? `para el tatami "${filtroTatami}"` : "disponibles"}</p>
            <button onClick={cargarControles}>Actualizar</button>
          </div>
        ) : (
          controlesFiltrados.map(control => (
            <div key={control.id} className="control-card">
              <div className="control-header">
                <span className="tatami-badge">Tatami: {control.tatamiId}</span>
                <span className="fecha">
                  {new Date(control.fechaCreacion).toLocaleString()}
                </span>
              </div>
              
              <div className="control-info">
                <div className="competidores">
                  <strong>Competidores:</strong>
                  {control.competidores?.map((comp, index) => (
                    <span key={index} className="competidor">
                      {comp.nombre || `Competidor ${index + 1}`}
                    </span>
                  ))}
                </div>
                <div className="estado-combate">
                  <strong>Estado:</strong> {control.estadoCombate}
                </div>
              </div>

              <div className="enlaces-controles">
                <strong>Controles:</strong>
                {control.enlaces?.map((enlace) => (
                  <div key={enlace.id} className="enlace-item">
                    <a
                      href={enlace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-enlace"
                    >
                      {enlace.nombre}
                    </a>
                    <button 
                      onClick={() => copiarEnlace(enlace.url)}
                      className="btn-copiar"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SalaControles;