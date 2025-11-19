import { useEffect, useState } from "react";
import "./VisorGlobal.css";

export default function VisorGlobal() {
  const [transmisiones, setTransmisiones] = useState([]);
  const [competidores, setCompetidores] = useState([]);
  const [qrUrl, setQrUrl] = useState("");

  // Función para generar la URL del torneo
  const generarUrlTorneo = () => {
    const baseUrl = "/tatami-manager";
    return baseUrl;
  };

  // Función para generar el código QR
  const generarQR = () => {
    const url = generarUrlTorneo();
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`);
  };

  // Función para traer transmisiones activas
const fetchTransmisiones = () => {
  console.log("🔄 Solicitando transmisiones activas...");
  
  fetch("/api/transmisiones-activas")
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("✅ Transmisiones recibidas:", data);
      
      if (!Array.isArray(data)) {
        console.error("❌ Los datos no son un array:", data);
        setTransmisiones([]);
        return;
      }
      
      setTransmisiones(data);
      
      // DEBUG: Mostrar primera transmisión
      if (data.length > 0) {
        console.log("🔍 Primera transmisión:", data[0]);
        console.log("👥 Competidores en primera transmisión:", data[0].competidores);
        console.log("🥊 Combate actual:", data[0].combateActual);
      }
    })
    .catch(err => {
      console.error("❌ Error fetch transmisiones:", err);
      setTransmisiones([]);
    });
};

  // Función para traer todos los datos
  const fetchData = () => {
    fetchTransmisiones();

    // Lista de competidores
    fetch("/api/competidores")
      .then(res => res.json())
      .then(data => {
        console.log("Competidores recibidos:", data);
        setCompetidores(data || []);
      })
      .catch(err => {
        console.error("Error fetch competidores:", err);
        setCompetidores([]);
      });
  };

  useEffect(() => {
    fetchData(); // primer carga inmediata
    generarQR(); // generar QR al montar el componente
    const intervalo = setInterval(fetchData, 5000); // refrescar cada 5s

    return () => clearInterval(intervalo);
  }, []);

  // Función para detener una transmisión
  const detenerTransmision = async (grupo) => {
    try {
      const response = await fetch("/api/detener-transmision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grupo })
      });

      if (response.ok) {
        fetchTransmisiones();
      }
    } catch (error) {
      console.error("Error al detener transmisión:", error);
    }
  };

  // Función para obtener el icono de la modalidad
  const obtenerIconoModalidad = (modalidad) => {
    switch (modalidad) {
      case 'salto_alto': return '🦘';
      case 'salto_largo': return '🏃';
      case 'combate': return 'Combate🥊';
      case 'formas': return 'Forma💫';
      case 'forma': return 'Formas💫';//<---este es el correcto
      default: return '❓';
    }
  };

  // Función para obtener el nombre de la modalidad
  const obtenerNombreModalidad = (modalidad) => {
    switch (modalidad) {
      case 'salto_alto': return 'Salto Alto';
      case 'salto_largo': return 'Salto Largo';
      case 'combate': return 'Combate';
      case 'formas': return 'Formas';
      case 'forma': return 'Formas';
      default: return modalidad;
    }
  };

  // Función para renderizar el combate actual - CORREGIDA
// Función para renderizar el combate actual - MÁS ROBUSTA
const renderCombateActual = (transmision) => {
  console.log("🎯 Renderizando combate para:", transmision.grupo);
  console.log("📊 Datos combateActual:", transmision.combateActual);
  
  // Si no hay combateActual o está vacío
  if (!transmision.combateActual) {
    return (
      <div className="competidores-transmision">
        <div className="competidor rojo">
          <span className="nombre-competidor">Esperando competidor</span>
        </div>
        <div className="vs">VS</div>
        <div className="competidor azul">
          <span className="nombre-competidor">Esperando competidor</span>
        </div>
      </div>
    );
  }

  const { competidor1, competidor2 } = transmision.combateActual;
  
  // Si los competidores no existen
  if (!competidor1 || !competidor2) {
    return (
      <div className="competidores-transmision">
        <div className="competidor rojo">
          <span className="nombre-competidor">Por definir</span>
        </div>
        <div className="vs">VS</div>
        <div className="competidor azul">
          <span className="nombre-competidor">Por definir</span>
        </div>
      </div>
    );
  }

  return (
    <div className="competidores-transmision">
      {/* Competidor Rojo */}
      <div className="competidor rojo">
        <span className="nombre-competidor">
          {competidor1.nombre || "Competidor Rojo"}
        </span>
        {competidor1.escuela && (
          <span className="escuela-competidor">{competidor1.escuela}</span>
        )}
        {competidor1.graduacion && (
          <span className="graduacion-competidor">{competidor1.graduacion}</span>
        )}
        {competidor1.dorsal && (
          <span className="dorsal-competidor">#{competidor1.dorsal}</span>
        )}
      </div>
      
      <div className="vs">VS</div>
      
      {/* Competidor Azul */}
      <div className="competidor azul">
        <span className="nombre-competidor">
          {competidor2.nombre || "Competidor Azul"}
        </span>
        {competidor2.escuela && (
          <span className="escuela-competidor">{competidor2.escuela}</span>
        )}
        {competidor2.graduacion && (
          <span className="graduacion-competidor">{competidor2.graduacion}</span>
        )}
        {competidor2.dorsal && (
          <span className="dorsal-competidor">#{competidor2.dorsal}</span>
        )}
      </div>
    </div>
  );
};

  // Función para renderizar próximos competidores - CORREGIDA
  const renderProximosCompetidores = (transmision) => {
    if (!transmision.proximosCompetidores || transmision.proximosCompetidores.length === 0) {
      return <p>No hay próximos competidores</p>;
    }

    return (
      <div className="lista-proximos-transmision">
        {transmision.proximosCompetidores.slice(0, 3).map((competidor, idx) => (
          <div key={idx} className="item-proximo-transmision">
            <span className="nombre-proximo">{competidor.nombre || "Por definir"}</span>
            {competidor.graduacion && (
              <span className="graduacion">{competidor.graduacion}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Función para renderizar las modalidades de un competidor
  const renderModalidades = (competidor) => {
    if (competidor.modalidades && Array.isArray(competidor.modalidades) && competidor.modalidades.length > 0) {
      return (
        <div className="modalidades-competidor">
          {competidor.modalidades.map((modalidad, idx) => (
            <span 
              key={idx} 
              className={`modalidad-badge ${modalidad}`}
              title={obtenerNombreModalidad(modalidad)}
            >
              {obtenerIconoModalidad(modalidad)}
            </span>
          ))}
        </div>
      );
    }
    
    if (competidor.modalidad) {
      return (
        <div className="modalidades-competidor">
          <span 
            className={`modalidad-badge ${competidor.modalidad}`}
            title={obtenerNombreModalidad(competidor.modalidad)}
          >
            {obtenerIconoModalidad(competidor.modalidad)}
          </span>
        </div>
      );
    }
    
    return (
      <div className="modalidades-competidor">
        <span className="modalidad-badge sin-modalidad" title="Sin modalidades">
          ❓
        </span>
      </div>
    );
  };

  return (
    <div className="visor-global">
      <header className="visor-header">
        <h1>🏆 VISOR GLOBAL - TRANSMISIONES EN CURSO</h1>
        <div className="contador-transmisiones">
          <span className="badge">{transmisiones.length} Transmisiones Activas</span>
        </div>
      </header>

      <div className="contenedor-principal">
        {/* Grid de transmisiones - PARTE PRINCIPAL */}
        <section className="transmisiones-grid">
          <h2>🎥 TRANSMISIONES EN CURSO</h2>
          {transmisiones.length > 0 ? (
            <div className="grid-transmisiones">
              {transmisiones.map((transmision, index) => (
                <div key={transmision.grupo || index} className="card-transmision">
                  <div className="transmision-header">
                    <h3>{transmision.grupo || `Transmisión ${index + 1}`}</h3>
                    <span className={`estado ${transmision.estado}`}>
                      {transmision.estado === 'transmitiendo' ? '🔴 EN VIVO' : '⏸️ PAUSADO'}
                    </span>
                  </div>
                  
                  <div className="transmision-info">
                    <div className="info-categoria">
                      <strong>Categoría:</strong> {transmision.categoria || "No especificada"}
                    </div>
                    <div className="info-modalidad">
                      <strong>Modalidad:</strong> {obtenerNombreModalidad(transmision.modalidad)}
                    </div>
                    
                    {/* Combate Actual - USANDO FUNCIÓN CORREGIDA */}
                    <div className="combate-transmision">
                      <h4>⚔️ COMBATE ACTUAL</h4>
                      {renderCombateActual(transmision)}
                    </div>

                    {/* Próximos Competidores - USANDO FUNCIÓN CORREGIDA */}
                    <div className="proximos-transmision">
                      <h4>📅 PRÓXIMOS</h4>
                      {renderProximosCompetidores(transmision)}
                    </div>

                    {/* Total de competidores */}
                    <div className="total-competidores">
                      <strong>Total competidores:</strong> {transmision.competidores?.length || 0}
                    </div>
                  </div>

                  <div className="transmision-actions">
                    <button 
                      className="btn-detener"
                      onClick={() => detenerTransmision(transmision.grupo)}
                    >
                      Detener Transmisión
                    </button>
                    <span className="timestamp">
                      {transmision.timestamp ? 
                        `Iniciada: ${new Date(transmision.timestamp).toLocaleTimeString()}` : 
                        'Sin timestamp'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sin-transmisiones">
              <p>No hay transmisiones activas en este momento</p>
              <div className="placeholder-transmision">
                <span>🎥 Las transmisiones aparecerán aquí cuando se inicien desde las llaves</span>
              </div>
            </div>
          )}
        </section>

        {/* Información general adicional */}
        <div className="informacion-general">
          {/* COLUMNA IZQUIERDA - QR */}
          <div className="columna-izquierda">
            <section className="bloque qr-container">
              <h2>📱 CÓDIGO QR</h2>
              <div className="qr-content">
                {qrUrl ? (
                  <>
                    <img 
                      src={qrUrl} 
                      alt="Código QR para información del torneo" 
                      className="qr-image"
                    />
                    <div className="qr-info">
                      <p className="qr-description">
                        <strong>Escanea para ver información completa:</strong>
                      </p>
                      <ul className="qr-features">
                        <li>✅ Resultados completos</li>
                        <li>✅ Historial de combates</li>
                        <li>✅ Info de competidores</li>
                        <li>✅ Clasificaciones</li>
                      </ul>
                      <div className="qr-actions">
                        <button 
                          className="btn-copiar-url"
                          onClick={() => navigator.clipboard.writeText(generarUrlTorneo())}
                        >
                          📋 Copiar URL
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Generando código QR...</p>
                )}
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA - COMPETIDORES */}
          <div className="columna-derecha">
            {/* Barra infinita de Competidores VERTICAL */}
            <section className="bloque barra-competidores-vertical">
              <h2>👥 COMPETIDORES ({competidores.length})</h2>
              {competidores.length > 0 ? (
                <div className="contenedor-barra-vertical">
                  <div className="barra-vertical">
                    <div className="contenido-vertical">
                      {/* Duplicamos el contenido para crear el efecto infinito */}
                      {[...competidores, ...competidores].map((competidor, index) => (
                        <div key={`${competidor.id}-${index}`} className="item-competidor-vertical">
                          <span className="dorsal-competidor">#{competidor.dorsal || "N/D"}</span>
                          <span className="nombre-competidor-v">{competidor.nombre}</span>
                          <span className="Salto-Alto">Salto Alto🦘</span>
                          <span className="Salto-Largo">Salto Largo🏃</span>

                          {/* Modalidades - CORREGIDO */}
                          {renderModalidades(competidor)}

                          {/* Tatami */}
                          <span className="tatami-competidor">
                            {competidor.tatami ? `Tatami ${competidor.tatami}` : 'Sin tatami'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No hay competidores registrados</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}