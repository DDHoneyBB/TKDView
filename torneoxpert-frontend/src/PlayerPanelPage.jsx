import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PlayerPanel from "./components/PlayerPanel";
import "./PlayerPanelPage.css"; // tu CSS existente (incluye estilos del dropdown y modal)

const globalSearchParams = new URLSearchParams(window.location.search);
const grupoParam = globalSearchParams.get("grupo");

function PlayerPanelPage({ medicalTime, setMedicalTime }) {
  const [resetKey, setResetKey] = useState(0);
  const [horaReset, setHoraReset] = useState("");
  const [combateEstado, setCombateEstado] = useState("pausado");
  const [combateIniciado, setCombateIniciado] = useState(false);
  const [enlaces, setEnlaces] = useState([]);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [descansoTime, setDescansoTime] = useState(false); // Nuevo estado
  const [tiempoDescanso, setTiempoDescanso] = useState(30); // 30 segundos por defecto
  // estados nuevos para puntajes en vivo
  const [mostrarPuntajes, setMostrarPuntajes] = useState(false);
  const [registrosEnVivo, setRegistrosEnVivo] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dnis = searchParams.get("dnis")?.split(",") || [];
  const [competidores, setCompetidores] = useState([]);

  // Determinar tatamiId a partir del parámetro grupo (igual que antes)
  let tatamiId = "0";
  if (grupoParam) {
    try {
      const grupoData = JSON.parse(decodeURIComponent(grupoParam));
      tatamiId = grupoData.tatamiId?.toString() || "0";
    } catch (error) {
      console.error("Error al parsear el parámetro 'grupo':", error);
    }
  }
  // -------------------------------
  // NUEVAS FUNCIONES: Control de descanso
  // -------------------------------
  const activarDescanso = (segundos = 30) => {
    setDescansoTime(true);
    setTiempoDescanso(segundos);
    setCombateEstado("pausado");
    
    console.log(`⏱️ Activando descanso de ${segundos} segundos para tatami:`, tatamiId);
    
    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        descansoTime: true,
        tiempoDescanso: segundos,
        varActivadora: false,
        accion: "descanso",
        estado: "pausado",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Descanso activado:", data))
      .catch((err) => console.error("Error:", err));
  };

  const desactivarDescanso = () => {
    setDescansoTime(false);
    
    console.log("⏱️ Desactivando descanso para tatami:", tatamiId);
    
    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        descansoTime: false,
        accion: "fin_descanso",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Descanso desactivado:", data))
      .catch((err) => console.error("Error:", err));
  };
  // -------------------------------
  // Funciones de control (existentes)
  // -------------------------------
  const handleInit = () => {
    const horaActual = new Date().toISOString();
    setHoraReset(horaActual);
    setCombateEstado("iniciado");
    setCombateIniciado(true);
    setMedicalTime(false); // ✅ Asegurar que se resetee
    setDescansoTime(false); // ✅ Resetear descanso

    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        varActivadora: true,
        medicalTime: false, // ✅ Incluir medicalTime
        accion: "iniciar",
        estado: "iniciado",
        hora: horaActual,
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Combate iniciado:", data))
      .catch((err) => console.error("Error:", err));
  };

  const pausarCombate = () => {
    setCombateEstado("pausado");
    setMedicalTime(false); // ✅ Resetear medicalTime al pausar
    setDescansoTime(false); // ✅ Resetear descanso

    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        varActivadora: false,
        medicalTime: false,
        accion: "pausar",
        estado: "pausado",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Combate pausado:", data))
      .catch((err) => console.error("Error:", err));
  };

  const reanudarCombate = () => {
    setCombateEstado("iniciado");
    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        varActivadora: true,
        accion: "reanudar",
        estado: "iniciado",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Combate reanudado:", data))
      .catch((err) => console.error("Error:", err));
  };

  const activarTiempoMedico = () => {
    setMedicalTime(true); // ✅ Solo usar medicalTime
    setCombateEstado("pausado");
    
    console.log("🏥 Activando tiempo médico para tatami:", tatamiId);
    
    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        medicalTime: true,
        varActivadora: false,
        accion: "tiempo_medico",
        estado: "pausado",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Tiempo médico activado:", data))
      .catch((err) => console.error("Error:", err));
  };

  const desactivarTiempoMedico = () => {
    setMedicalTime(false); // ✅ Solo usar medicalTime
    
    console.log("🏥 Desactivando tiempo médico para tatami:", tatamiId);
    
    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        medicalTime: false,
        accion: "fin_tiempo_medico",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Tiempo médico desactivado:", data))
      .catch((err) => console.error("Error:", err));
  };

  const siguienteCombate = () => {
    fetch("/api/enviar/panel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatamiId: tatamiId,
        varActivadora: false,
        proximoCombate: true,
        accion: "siguiente_combate",
        estado: "rotando_competidores",
        timestamp: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Siguiente combate señal enviada:", data);
        return fetch(`/api/registros/${tatamiId}`, { method: "DELETE" });
      })
      .then((r) => r.json())
      .then((data) => {
        console.log("✅ Registros eliminados:", data);
        limpiarTatami();
      })
      .catch((err) => console.error("Error:", err));
  };

  const limpiarTatami = () => {
    console.log("🧹 Limpiando tatami desde frontend...");
    setCompetidores([]);
    setHoraReset("");
    setCombateIniciado(false);
    setCombateEstado("pausado");
    setMedicalTime(false); // ✅ Resetear medicalTime
    setResetKey((prev) => prev + 1);
    setMostrarPuntajes(false);
  };

  // -------------------------------
  // Cargar competidores por DNI
  // -------------------------------
  useEffect(() => {
    if (dnis.length > 0) {
      fetch(`/api/competidores/by-dni?dnis=${dnis.join(",")}`)
        .then((res) => res.json())
        .then((data) => {
          const unicos = [];
          const vistos = new Set();
          for (const c of data) {
            if (!vistos.has(c.dni)) {
              unicos.push(c);
              vistos.add(c.dni);
            }
          }
          setCompetidores(unicos);
        })
        .catch(() => setCompetidores([]));
    }
  }, [dnis]);

  // -------------------------------
  // Generación de links (dropdown) - EXACTAMENTE como lo tenías
  // -------------------------------
  const toggleDropdown = () => setDropdownAbierto((s) => !s);

  const copiarEnlace = (url) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`)
      .then(() => console.log("Enlace copiado al portapapeles"))
      .catch(err => console.error("Error al copiar: ", err));
  };

  const guardarControles = async (enlacesGenerados) => {
    try {
      console.log('🔄 Intentando guardar controles...', {
        tatamiId,
        cantidadEnlaces: enlacesGenerados.length,
        competidores: competidores.length,
        estadoCombate: combateEstado
      });

      const response = await fetch("/api/controles/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tatamiId: tatamiId,
          enlaces: enlacesGenerados,
          competidores: competidores,
          estadoCombate: combateEstado
        }),
      });
      
      console.log('📡 Respuesta del servidor:', response.status);
      
      const data = await response.json();
      console.log('📄 Datos de respuesta:', data);
      
      if (data.success) {
        console.log("✅ Controles guardados en backend:", data.control.enlaces.length, "enlaces");
      } else {
        console.error("❌ Error guardando controles:", data.error);
      }
    } catch (error) {
      console.error("❌ Error de conexión guardando controles:", error);
    }
  };

  const handleTransmitir = () => {
    const params = new URLSearchParams(window.location.search);
    const grupoParamLocal = params.get("grupo");

    let tatamiIdActual = tatamiId;
    if (grupoParamLocal) {
      try {
        const grupoData = JSON.parse(decodeURIComponent(grupoParamLocal));
        tatamiIdActual = grupoData.tatamiId;
      } catch (err) {
        console.warn("Error parseando grupo en handleTransmitir:", err);
      }
    }

    const letras = ["A", "B", "C", "D"];
    const nuevosEnlaces = letras.map((letra) => ({
      id: `juez-${letra}-${Date.now()}`,
      letra,
      nombre: `Juez ${letra}`,
      url: `/tatami-sala?id=${letra}&tatamiId=${tatamiIdActual}${/*&competidores=${encodeURIComponent(JSON.stringify(competidores))}&horaReset=${encodeURIComponent(horaReset)}&combateEstado=${combateEstado}*/""}`,
    }));

    setEnlaces(nuevosEnlaces);
    setDropdownAbierto(true);
    guardarControles(nuevosEnlaces);
  };

  // -------------------------------
  // PUNTAJES EN VIVO: obtener registros y puntajes finales
  // -------------------------------
  const fetchRegistros = async () => {
    try {
      const res = await fetch(`/api/registros/${tatamiId}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setRegistrosEnVivo(data || []);
    } catch (err) {
      console.error("❌ Error al obtener registros:", err);
    }
  };

  // cuando se muestra el modal, arrancan las actualizaciones periódicas
  useEffect(() => {
    if (!mostrarPuntajes) return;
    // carga inmediata
    fetchRegistros();


    const intervalo = setInterval(() => {
      fetchRegistros();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [mostrarPuntajes, tatamiId]);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <>
      {/* BOTONES PRINCIPALES */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
        <button onClick={() => navigate("/dashboard")}>Volver a Tatamis</button>

            {/* NUEVO BOTÓN DE TIEMPO MÉDICO */}
        {!medicalTime ? (
          <button 
            onClick={activarTiempoMedico} 
            style={{ backgroundColor: "#ff9800", color: "white" }}
            disabled={!combateIniciado}
          >
            🏥 Tiempo Médico
          </button>
        ) : (
          <button 
            onClick={desactivarTiempoMedico} 
            style={{ backgroundColor: "#4caf50", color: "white" }}
          >
            ✅ Finalizar Tiempo Médico
          </button>
        )}

        {combateEstado === "pausado" ? (
          <button onClick={reanudarCombate} style={{ backgroundColor: "green" }}>
            ▶️ Reanudar Combate
          </button>
        ) : (
          <button onClick={pausarCombate} style={{ backgroundColor: "orange" }}>
            ⏸️ Pausar Combate
          </button>
        )}

        {!combateIniciado ? (
          <button onClick={handleInit} style={{ backgroundColor: "#b71c1c" }}>
            🥋 Iniciar Combate
          </button>
        ) : (
          <button onClick={siguienteCombate} style={{ backgroundColor: "purple" }}>
            ⏭️ Siguiente Combate
          </button>
        )}

        <button onClick={handleTransmitir} style={{ backgroundColor: "#2196f3" }}>
          🔗 Generar Links de Controles
        </button>
      </div>

      {/* BOTONES DE LIMPIEZA / PUNTAJES (mantengo tu btn-clear intacto) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.8rem" }}>
        <button
  className="btn-clear"
  onClick={() => {
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/registros/${tatamiId}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}: ${r.statusText}`);
        return r.json();
      })
      .then((data) => {
        console.log("✅ Tatami limpiado:", data);
        limpiarTatami();
      })
      .catch((err) => console.error("Error al limpiar tatami:", err));
  }}
>
  🧹 Limpiar Panel
</button>


        {/* BOTONES DE DESCANSO */}
        {!descansoTime ? (
          <>
            <button 
              onClick={() => activarDescanso(30)} 
              style={{ backgroundColor: "#ffeb3b", color: "black" }}
              disabled={!combateIniciado}
            >
              ⏱️ Descanso 30s
            </button>
            <button 
              onClick={() => activarDescanso(60)} 
              style={{ backgroundColor: "#ffc107", color: "black" }}
              disabled={!combateIniciado}
            >
              ⏱️ Descanso 1m
            </button>
          </>
        ) : (
          <button 
            onClick={desactivarDescanso} 
            style={{ backgroundColor: "#4caf50", color: "white" }}
          >
            ✅ Finalizar Descanso
          </button>
        )}

        <button
          onClick={() => setMostrarPuntajes((s) => !s)}
          style={{ backgroundColor: "#009688", color: "white" }}
        >
          📊 Puntajes en vivo
        </button>
      </div>

      {/* DROPDOWN ANIMADO PARA LOS LINKS (RESTAURO EXACTAMENTE TU UI) */}
      {enlaces.length > 0 && (
        <div className="dropdown-container">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            📋 Controles Disponibles
            <span className={`dropdown-arrow ${dropdownAbierto ? "open" : ""}`}>▼</span>
          </button>

          <div className={`dropdown-content ${dropdownAbierto ? "show" : ""}`}>
            <div className="dropdown-header">
              <h3>Enlaces de Jueces</h3>
              <button className="close-dropdown" onClick={() => setDropdownAbierto(false)}>×</button>
            </div>

            <div className="links-grid">
              {enlaces.map(({ id, letra, url }) => (
                <div key={id || letra} className="link-item">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="link-button">
                    <span className="judge-icon">⚖️</span> Juez {letra}
                  </a>
                  <button className="copy-button" onClick={() => copiarEnlace(url)} title="Copiar enlace">📋</button>
                </div>
              ))}
            </div>

            <div className="dropdown-footer">
              <small>Haz clic en 📋 para copiar el enlace</small>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / PANEL PUNTAJES EN VIVO */}
      {mostrarPuntajes && (
        <div className="puntajes-modal">
          <div className="puntajes-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Puntajes en vivo - Tatami {tatamiId}</h3>
              <div>
                <button onClick={() => { fetchRegistros();}}>🔄 Refrescar</button>
                <button onClick={() => setMostrarPuntajes(false)} style={{ marginLeft: "0.5rem" }}>❌ Cerrar</button>
              </div>
            </div>

            <section style={{ marginTop: "0.5rem" }}>
              <h4>Registros (se muestran en orden ascendente por 'fecha')</h4>
              <table>
                <thead>
                  <tr>
                    <th>⏱ (s)</th>
                    <th>⚖️ Juez</th>
                    <th>🥋 Competidor</th>
                    <th>⭐ Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosEnVivo.length === 0 ? (
                    <tr><td colSpan="4">Sin registros aún...</td></tr>
                  ) : (
                    registrosEnVivo.map((r) => (
                      <tr key={r.id}>
                        <td>{r.fecha}</td>
                        <td>{r.juez}</td>
                        <td>{r.competidor}</td>
                        <td style={{ fontWeight: "bold" }}>{r.valor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}

      {/* PLAYER PANELS */}
      <div className="app">
        <div className="chong">
          <PlayerPanel
            key={`panel-${tatamiId}-${resetKey}-A`}
            id={"0"}
            title={competidores[0]?.nombre || "Competidor A"}
            style={{ color: "#1900ff" }}
            combateEstado={combateEstado}
            onCombateEstadoChange={setCombateEstado}
            tatamiId={tatamiId}
            data={horaReset}
            limpiarTatami={limpiarTatami}
          />
        </div>

        <div className="hong">
          <PlayerPanel
            key={`panel-${tatamiId}-${resetKey}-B`}
            id={"1"}
            title={competidores[1]?.nombre || "Competidor B"}
            style={{ color: "rgb(255, 0, 0)" }}
            combateEstado={combateEstado}
            onCombateEstadoChange={setCombateEstado}
            tatamiId={tatamiId}
            data={horaReset}
            limpiarTatami={limpiarTatami}
          />
        </div>
      </div>
    </>
  );
}

export default PlayerPanelPage;