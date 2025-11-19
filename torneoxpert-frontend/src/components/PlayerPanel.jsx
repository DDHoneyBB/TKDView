import React, { useState, useEffect } from "react";
import "../app.css";
import ListadoPuntuaciones from "./listadoPuntuaciones";
import { useLocation } from "react-router-dom";

function PlayerPanel({ data, id, title, combateEstado, onCombateEstadoChange, tatamiId, medicalTime, setMedicalTime }) {
  const location = useLocation();
  const [warnings, setWarnings] = useState(0);
  const [discounts, setDiscounts] = useState(0);
  const [salto360, setSalto360] = useState(null);
  const [disqualified, setDisqualified] = useState(false);
  const [mostrarReiniciar, setMostrarReiniciar] = useState(false);
  const [total1, setTotal1] = useState(0);
  const [total2, setTotal2] = useState(0); 
  const [scores, setScores] = useState([]);
  const [mostrarListado, setMostrarListado] = useState(false);
  const [grupoData, setGrupoData] = useState(null);
  const [medicalTimeInput, setMedicalTimeInput] = useState(2); // valor inicial en minutos

  // Obtener datos del grupo desde la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const grupoParam = searchParams.get('grupo');
    
    if (grupoParam) {
      try {
        const grupoDecodificado = JSON.parse(decodeURIComponent(grupoParam));
        setGrupoData(grupoDecodificado);
        console.log("Datos del grupo recibidos:", grupoDecodificado);
      } catch (error) {
        console.error("Error al parsear datos del grupo:", error);
      }
    }
  }, [location]);

  useEffect(() => {
    const obtenerDatosTatami = async () => {
      console.log("🔄 Iniciando fetch de datos para tatami:", tatamiId);
      try {
        const res = await fetch(`/api/valores/controles?tatami=${tatamiId}`);
        const data = await res.json();

        if (!data || Object.keys(data).length === 0) return;

        console.log("📥 Nuevos datos recibidos:", data);

        setTotal1(data.total1);
        setTotal2(data.total2);

      } catch (error) {
        console.error("❌ Error al obtener datos del tatami:", error);
      }
    };
    obtenerDatosTatami();
    const intervalo = setInterval(obtenerDatosTatami, 2000);
    return () => clearInterval(intervalo);
  }, [tatamiId]);

  const obtenerDNIsCompetidores = () => {
    if (grupoData && grupoData.competidores) {
      return grupoData.competidores
        .map(comp => comp.dni)
        .filter(dni => dni && dni.trim() !== "");
    }
    
    if (data && data.competidores) {
      return data.competidores
        .map(comp => comp.dni)
        .filter(dni => dni && dni.trim() !== "");
    }
    
    if (data && data.grupo && data.grupo.competidores) {
      return data.grupo.competidores
        .map(comp => comp.dni)
        .filter(dni => dni && dni.trim() !== "");
    }
    
    console.warn("No se encontraron DNIs de competidores");
    return [];
  };

  const handleTransmitir = () => {
    const dnis = obtenerDNIsCompetidores();
    
    if (dnis.length === 0) {
      alert("No hay DNIs de competidores disponibles");
      return;
    }

    const categoria = grupoData?.categoria || data?.categoria || "Sin categoría";
    const modalidad = grupoData?.modalidad || data?.modalidad || "combate";
    const tatamiNombre = grupoData?.tatamiNombre || `Tatami ${tatamiId}`;
    
    const params = new URLSearchParams({
      id: id,
      dnis: dnis.join(","),
      categoria: categoria,
      modalidad: modalidad,
      tatamiNombre: tatamiNombre
    });
    const urlTatami = `../tatami?id=${tatamiId}&dnis=${dnis.join(",")}&categoria=${categoria}&modalidad=${modalidad}`;
    
    window.open(urlTatami, `tatami_${tatamiId}`, 'width=1000,height=700,menubar=no,toolbar=no,location=no');
  };

  useEffect(() => {
    if (combateEstado === 'pausado') {
      console.log(`Tatami ${tatamiId} - Combate pausado`);
    } else if (combateEstado === 'iniciado') {
      console.log(`Tatami ${tatamiId} - Combate reanudado`);
    }
  }, [combateEstado, tatamiId]);

  const handleDelete = (index) => {
    if (disqualified || medicalTime) return;
    const updated = [...scores];
    updated.splice(index, 1);
    setScores(updated);
  };

  const handleWarning = () => {
    if (disqualified || medicalTime) return;
    setWarnings((prev) => prev + 1);
  };

  const handleDiscount = () => {
    if (disqualified || medicalTime) return;
    setDiscounts((prev) => prev + 1);
  };

  const handleDisqualification = () => {
    if (medicalTime) return;
    setDisqualified(true);

    fetch("/api/descalificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jugador: title,
        id,
        descalificado: true,
        timestamp: new Date().toISOString(),
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log("Descalificación enviada:", data);
      })
      .catch(err => {
        console.error("Error enviando descalificación:", err);
      });
  };

  const handleSalto = (value) => {
    if (disqualified || medicalTime) return;
    setSalto360(value);
  };

  const undoWarning = () => {
    if (disqualified || medicalTime) return;
    setWarnings((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const undoDiscount = () => {
    if (disqualified || medicalTime) return;
    setDiscounts((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const undoSalto = () => {
    if (disqualified || medicalTime) return;
    setSalto360(null);
  };

  const handleTimeChange = (index, newTime) => {
    if (medicalTime) return;
    const updated = [...scores];
    updated[index].time = newTime;
    setScores(updated);
  };

  const getTotal = () => {
    if (disqualified) return 0;
    let total = 0;
    if (id === "0") {
      total = total1;
    } else if (id === "1") {
      total = total2;
    }
    total -= Math.floor(warnings / 3);
    total -= discounts;
    if (salto360 === true) total += 2;
    if (salto360 === false) total -= 2;
    return total < 0 ? 0 : total;
  };

  const handleAccept = () => {
    const total = getTotal();

    fetch("/api/aceptar-puntaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jugador: title,
        id,
        total,
        advertencias: warnings,
        descuentos: discounts,
        salto360,
        descalificado: disqualified,
        timestamp: new Date().toISOString(),
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log("Puntaje enviado:", data);
        alert(`Total de ${title}: ${total} puntos`);
      })
      .catch(err => {
        console.error("Error enviando puntaje:", err);
        alert("Error al enviar el puntaje");
      });
  };



const handleReiniciarCombate = () => {
  console.log("🔄 Reiniciando combate después de tiempo médico");
  
  fetch("/api/enviar/panel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tatamiId: tatamiId,
      jugador: title,
      id,
      medicalTime: false,
      reiniciarCombate: true, // ← Nueva señal para reinicio
      accion: 'reiniciar_combate',
      timestamp: new Date().toISOString(),
    }),
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ Combate reiniciado:", data);
    setMostrarReiniciar(false);
    setMedicalTime(false);
  })
  .catch(err => {
    console.error("❌ Error reiniciando combate:", err);
  });
};

  useEffect(() => {
    const obtenerTimerCentral = async () => {
      try {
        const res = await fetch(`/api/tiempo-central?tatami=${tatamiId}`);
        const data = await res.json();
        if (data.minutos !== undefined) {
          setMedicalTimeInput(data.minutos);
        }
      } catch (err) {
        console.error("Error al obtener timer central:", err);
      }
    };

    obtenerTimerCentral();
    const intervalo = setInterval(obtenerTimerCentral, 2000);
    return () => clearInterval(intervalo);
  }, [tatamiId]);

  const handleEnviarGanador = async () => {
    const totalJugador1 = total1;
    const totalJugador2 = total2;
  };

  const cerrarPopupListado = () => {
    setMostrarListado(false);
  };

  const renderInfoGrupo = () => {
    if (!grupoData) return null;

    return (
      <div style={{ 
        background: '#f0f8ff', 
        padding: '0.5rem', 
        marginBottom: '1rem',
        borderRadius: '4px',
        border: '1px solid #d1ecf1'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          📋 {grupoData.tatamiNombre} - {grupoData.categoria}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          Modalidad: {grupoData.modalidad} • Competidores: {grupoData.totalCompetidores}
          {grupoData.rondaActual && ` • Ronda: ${grupoData.rondaActual}`}
        </div>
      </div>
    );
  };

  return (
    <div className={`player-panel ${medicalTime ? "paused" : ""}`}>
      <h2>{title}</h2>
      
      {/* Información del grupo */}
      {renderInfoGrupo()}
      
      {/* Botón Transmitir */}
      <button
        className="boton boton-transmitir"
        onClick={handleTransmitir}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        Abrir Sala
      </button>

    <div style={{ marginTop: "1rem" }}>
      <label>
        ⏱️ Timer principal:
        <select
          value={medicalTimeInput}
          onChange={(e) => {
            const minutos = parseFloat(e.target.value);
            setMedicalTimeInput(minutos);

            // ✅ Enviar al backend
            fetch("/api/ajustar-timer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tatamiId,
                minutos,
                accion: "configuracion",
                timestamp: new Date().toISOString(),
              }),
            })
            .then((res) => res.json())
            .then((data) => console.log("✅ Timer configurado:", data))
            .catch((err) => console.error("❌ Error configurando timer:", err));
          }}
          style={{ 
            marginLeft: "0.5rem", 
            padding: "0.3rem",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        >
          <option value={0.5}>30 segundos</option>
          <option value={1}>1 minuto</option>
          <option value={2}>2 minutos</option>
        </select>
      </label>
    </div>

      <div className="info">
        <button
          className="player-adv"
          onClick={handleWarning}
          disabled={disqualified || medicalTime}
          style={{ backgroundColor: "white", marginTop: "0.5rem" }}
          aria-label="Agregar advertencia"
        >
          ⚠️ Advertencia ({warnings}) → (-1 cada 3)
        </button>

        <button
          onClick={handleDiscount}
          disabled={disqualified || medicalTime}
          style={{ backgroundColor: "gold", marginTop: "0.5rem" }}
          aria-label="Agregar descuento"
        >
          ➖ Descuento ({discounts}) → (-1 c/u)
        </button>

        <button
          onClick={handleDisqualification}
          disabled={disqualified || medicalTime}
          style={{ backgroundColor: "red", color: "white", marginTop: "0.5rem" }}
          aria-label="Descalificar jugador"
        >
          ❌ Descalificar
        </button>
      </div>

      <div>¿Se realizó Salto 360?</div>
      <div className="salto-sect">
        <button
          className="player"
          onClick={() => handleSalto(true)}
          disabled={disqualified || medicalTime}
          style={{
            color: "white",
            backgroundColor: salto360 === true ? "green" : "#000000ff",
            marginRight: "8px",
          }}
          aria-pressed={salto360 === true}
        >
          SI (+2)
        </button>
        <button
          className="player"
          onClick={() => handleSalto(false)}
          disabled={disqualified || medicalTime}
          style={{
            color: "white",
            backgroundColor: salto360 === false ? "red" : "#000000ff",
          }}
          aria-pressed={salto360 === false}
        >
          NO (-2)
        </button>
      </div>

      <div className="Contenedor-pnts-y-vid">
        <div>Total: {getTotal()} puntos</div>
        <button onClick={() => {
          if (warnings > 0) {
            undoWarning();
          } else if (discounts > 0) {
            undoDiscount();
          } else {
            undoSalto();
          }}}
          className="Repeticion"
        >
          Eliminar Ultima Acción
        </button>
      </div>

      <button
        className="player btn-accept"
        onClick={handleAccept}
        disabled={(disqualified && getTotal() === 0) || medicalTime}
      >
        Aceptar
      </button>

      <button
  onClick={handleEnviarGanador}
  style={{
    backgroundColor: "#28a745",
    color: "white",
    fontWeight: "bold",
    padding: "0.7rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    marginTop: "1rem",
    width: "100%"
  }}
>
  ✅ Aceptar Ganador
</button>


      {/* Popup del Listado de Puntuaciones */}
      {mostrarListado && (
        <div className="popup-overlay" onClick={cerrarPopupListado}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>📊 Listado de Puntuaciones - {title}</h3>
              <button className="popup-close" onClick={cerrarPopupListado}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <ListadoPuntuaciones tatamiId={tatamiId} jugadorId={id} />
            </div>
            <div className="popup-footer">
              <button 
                className="popup-close-btn"
                onClick={cerrarPopupListado}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerPanel;