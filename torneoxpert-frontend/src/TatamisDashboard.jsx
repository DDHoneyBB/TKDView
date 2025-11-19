import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function TatamisDashboard() {
  const [tatamis, setTatamis] = useState([]);
  const [llavesCombate, setLlavesCombate] = useState([]);
  const [llavesForma, setLlavesForma] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLlaves, setLoadingLlaves] = useState(false);
  const [llaveSeleccionada, setLlaveSeleccionada] = useState(null);
  const [tatamiABorrar, setTatamiABorrar] = useState(null);
  const navigate = useNavigate();
  const volverAlMenu = () => navigate("/");

  // Cargar lista de tatamis
  const cargarTatamis = () => {
    fetch("/api/lista-tatamis")
      .then(res => res.json())
      .then(data => setTatamis(data))
      .catch(err => console.error("Error obteniendo tatamis:", err));
  };

  // Cargar llaves de combate
  const cargarLlavesCombate = () => {
    setLoadingLlaves(true);
    fetch("/api/brackets")
      .then(res => res.json())
      .then(data => {
        console.log("Llaves de combate cargadas:", data.brackets);
        setLlavesCombate(data.brackets || []);
      })
      .catch(err => console.error("Error obteniendo llaves de combate:", err))
      .finally(() => setLoadingLlaves(false));
  };

  // Cargar llaves de forma
  const cargarLlavesForma = () => {
    setLoadingLlaves(true);
    fetch("/api/brackets-forma")
      .then(res => res.json())
      .then(data => {
        console.log("Llaves de forma cargadas:", data.brackets);
        setLlavesForma(data.brackets || []);
      })
      .catch(err => console.error("Error obteniendo llaves de forma:", err))
      .finally(() => setLoadingLlaves(false));
  };

  // Crear nuevo tatami
  const crearTatami = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/crear-tatami`, {
        method: 'POST'
      });
      const data = await response.json();
      cargarTatamis();
    } catch (error) {
      console.error("Error creando tatami:", error);
    } finally {
      setLoading(false);
    }
  };

  // Borrar tatami
// Borrar tatami - REEMPLAZA ESTA FUNCIÓN
const borrarTatami = async (tatamiId) => {
  try {
    const response = await fetch(`/api/borrar-tatami`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tatami_id: tatamiId })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Tatami borrado:", data);
      alert(`Tatami ${tatamiId} borrado exitosamente`);
      cargarTatamis(); // Recargar la lista
    } else {
      // Manejar errores de respuesta
      try {
        const error = await response.json();
        alert(`Error al borrar tatami: ${error.error}`);
      } catch (parseError) {
        alert(`Error al borrar tatami: ${response.status} ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error("Error al borrar tatami:", error);
    alert("Error de conexión al intentar borrar el tatami");
  } finally {
    setTatamiABorrar(null);
  }
};

  // Confirmar borrado
  const confirmarBorrado = (tatami) => {
    setTatamiABorrar(tatami);
  };

  const cancelarBorrado = () => {
    setTatamiABorrar(null);
  };

  useEffect(() => {
    cargarTatamis();
    cargarLlavesCombate();
    cargarLlavesForma();
  }, []);

  // Función auxiliar para determinar la ronda actual
  const determinarRondaActual = (grupo) => {
    if (grupo.final) return "final";
    if (grupo.semis && grupo.semis.some(s => s)) return "semifinal";
    return "cuartos";
  };

  // Función para obtener información detallada de los competidores
  const obtenerInfoCompetidores = (grupo) => {
    if (!grupo.competidores || grupo.competidores.length === 0) {
      return { total: 0, lista: [] };
    }

    const competidoresInfo = grupo.competidores.map(comp => ({
      id: comp.id,
      nombre: comp.nombre,
      dni: comp.dni,
      escuela: comp.escuela,
      graduacion: comp.graduacion,
      categoria: comp.categoria,
      dorsal: comp.dorsal,
    }));

    return {
      total: competidoresInfo.length,
      lista: competidoresInfo
    };
  };

  // Función para abrir panel de jueces con una llave específica
  const abrirPanelJuecesConLlave = (tatami, grupo, modo) => {
    const infoCompetidores = obtenerInfoCompetidores(grupo);
    
    // Crear objeto con toda la información necesaria
    const grupoInfo = {
      tatamiId: tatami.id,
      tatamiNombre: tatami.nombre || `Tatami ${tatami.id}`,
      grupoId: grupo.grupo,
      modalidad: modo,
      competidores: infoCompetidores.lista,
      totalCompetidores: infoCompetidores.total,
      dnis: grupo.dnis || [],
      categoria: grupo.competidores?.[0]?.categoria || "Sin categoría",
      rondaActual: determinarRondaActual(grupo),
      // Información de la estructura de la llave si existe
      llave: grupo.llave,
      semis: grupo.semis,
      final: grupo.final
    };

    console.log("Enviando información al PlayerPanel:", grupoInfo);

    // Codificar la información para pasarla por URL
    const grupoInfoCodificado = encodeURIComponent(JSON.stringify(grupoInfo));
    
    window.open(
      `/player-panel?grupo=${grupoInfoCodificado}&dnis=${grupo.dnis.join(",")}`,
      "_blank"
    );
  };

  // Función para mostrar detalles de una llave específica
  const mostrarDetallesLlave = (grupo, modo) => {
    setLlaveSeleccionada({ grupo, modo });
  };

  // Función para obtener el orden correcto de los competidores según su posición en la llave
  const obtenerCompetidoresEnOrden = (grupo) => {
    if (!grupo.llave || !grupo.competidores) return grupo.competidores;
    
    // Crear un mapa de competidores por ID para acceso rápido
    const competidoresMap = {};
    grupo.competidores.forEach(comp => {
      competidoresMap[comp.id] = comp;
    });
    
    // Recorrer la estructura de la llave para obtener el orden correcto
    const competidoresOrdenados = [];
    
    // Función recursiva para recorrer la llave
    const recorrerLlave = (nodo) => {
      if (nodo.competidorId && competidoresMap[nodo.competidorId]) {
        competidoresOrdenados.push(competidoresMap[nodo.competidorId]);
      }
      
      if (nodo.hijos) {
        nodo.hijos.forEach(hijo => recorrerLlave(hijo));
      }
    };
    
    // Iniciar el recorrido desde la raíz de la llave
    if (grupo.llave.raiz) {
      recorrerLlave(grupo.llave.raiz);
    }
    
    return competidoresOrdenados.length > 0 ? competidoresOrdenados : grupo.competidores;
  };

  // Función para iniciar transmisión
  const iniciarTransmision = async (grupo, modo) => {
    try {
      // 1. Obtener competidores en el orden CORRECTO de la llave
      const competidoresOrdenados = obtenerCompetidoresEnOrden(grupo);
      
      console.log("Competidores ordenados:", competidoresOrdenados.map(c => c.nombre));
      
      // 2. Preparar datos para transmisión CON ORDEN CORRECTO
      const datosTransmision = {
        grupo: grupo.grupo,
        categoria: grupo.categoria || grupo.competidores[0]?.categoria,
        combateActual: {
          competidor1: competidoresOrdenados[0], // PRIMERO: combate actual rojo
          competidor2: competidoresOrdenados[1]  // SEGUNDO: combate actual azul
        },
        proximosCompetidores: competidoresOrdenados.slice(2, 4).map(comp => ({
          nombre: comp?.nombre,
          graduacion: comp?.graduacion,
          escuela: comp?.escuela
        })),
        competidores: competidoresOrdenados,
        modalidad: modo === "forma" ? "formas" : "combate",
        estado: "transmitiendo",
        timestamp: new Date().toISOString()
      };

      // 3. Enviar al servidor
      const response = await fetch("/api/iniciar-transmision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTransmision)
      });

      if (response.ok) {
        console.log("Transmisión iniciada con competidores ordenados");
        
        // 4. Abrir TatamiView con DNIs en ORDEN CORRECTO
        const dnisOrdenados = competidoresOrdenados.map(c => c.dni).join(",");
        const modoTransmision = modo === "forma" ? "formas" : "combate";
      
        {/*window.open(
          `/tatami?dnis=${dnisOrdenados}&mode=${modoTransmision}&grupo=${grupo.grupo}`,
          "_blank"
        );*/}
      }
    } catch (error) {
      console.error("Error al iniciar transmisión:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Panel de Tatamis</h1>

      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={crearTatami}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "16px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          {loading ? "Creando..." : "➕ Crear nuevo Tatami"}
        </button>

        <button
          onClick={() => {
            cargarLlavesCombate();
            cargarLlavesForma();
          }}
          disabled={loadingLlaves}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "4px"
          }}
        >
          {loadingLlaves ? "Actualizando..." : "🔄 Actualizar Llaves"}
        </button>
      </div>

      {/* Resumen detallado de llaves disponibles */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#e7f3ff', padding: '1rem', borderRadius: '8px' }}>
          <h3>Llaves de Combate</h3>
          <p><strong>Total:</strong> {llavesCombate.length} grupos</p>
          <p><strong>Competidores:</strong> {llavesCombate.reduce((total, llave) => total + (llave.competidores?.length || 0), 0)}</p>
          <p><strong>Categorías:</strong> {[...new Set(llavesCombate.flatMap(llave => llave.competidores?.map(c => c.categoria) || []))].join(', ')}</p>
        </div>
        
        <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px' }}>
          <h3>Llaves de Forma</h3>
          <p><strong>Total:</strong> {llavesForma.length} grupos</p>
          <p><strong>Competidores:</strong> {llavesForma.reduce((total, llave) => total + (llave.competidores?.length || 0), 0)}</p>
          <p><strong>Categorías:</strong> {[...new Set(llavesForma.flatMap(llave => llave.competidores?.map(c => c.categoria) || []))].join(', ')}</p>
        </div>
      </div>

      {/* Modal de confirmación para borrar tatami */}
      {tatamiABorrar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '90%',
            width: '400px',
            textAlign: 'center'
          }}>
            <h3>¿Borrar Tatami?</h3>
            <p>¿Estás seguro de que quieres borrar el <strong>Tatami {tatamiABorrar.id}</strong>?</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
              Esta acción no se puede deshacer.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => borrarTatami(tatamiABorrar.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sí, Borrar
              </button>
              <button
                onClick={cancelarBorrado}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de llave */}
      {llaveSeleccionada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            width: '600px'
          }}>
            <h2>Detalles de Llave: {llaveSeleccionada.grupo.grupo}</h2>
            <p><strong>Modalidad:</strong> {llaveSeleccionada.modo}</p>
            <p><strong>Total competidores:</strong> {llaveSeleccionada.grupo.competidores?.length || 0}</p>
            <p><strong>Ronda actual:</strong> {determinarRondaActual(llaveSeleccionada.grupo)}</p>
            
            <h3>Competidores:</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {llaveSeleccionada.grupo.competidores?.map((comp, index) => (
                <div key={comp.id} style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  margin: '0.5rem 0',
                  borderRadius: '4px',
                  background: '#f9f9f9'
                }}>
                  <strong>{index + 1}. {comp.nombre}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    <div>DNI: {comp.dni} | Dorsal: {comp.dorsal || 'N/A'}</div>
                    <div>Escuela: {comp.escuela} | Graduación: {comp.graduacion}</div>
                    <div>Categoría: {comp.categoria}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setLlaveSeleccionada(null)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {tatamis.length === 0 ? (
        <p>No hay tatamis disponibles todavía</p>
      ) : (
        <div>
          <h2>Tatamis Disponibles</h2>
          <div className="tatami-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1rem'
          }}>
            {tatamis.map(tatami => (
              <div key={tatami.id} className="tatami-card" style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                background: '#f9f9f9',
                position: 'relative'
              }}>
                {/* Botón de borrar en la esquina superior derecha */}
                <button
                  onClick={() => confirmarBorrado(tatami)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}
                  title="Borrar tatami"
                >
                  ×
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <strong>Tatami {tatami.id}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.2rem' }}>
                      <strong>Estado:</strong> {tatami.estado}
                    </div>
                    {tatami.categoria_actual && (
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        <strong>Categoría actual:</strong> {tatami.categoria_actual}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="tatami-actions" style={{ marginTop: '1rem' }}>
                  {/* Selector de llaves para Panel de Jueces */}
                  <select
                    onChange={(e) => {
                      const [tipo, index] = e.target.value.split('-');
                      if (tipo && index !== undefined) {
                        const llaves = tipo === 'combate' ? llavesCombate : llavesForma;
                        const grupo = llaves[parseInt(index)];
                        if (grupo) {
                          iniciarTransmision(grupo, tipo);
                          abrirPanelJuecesConLlave(tatami, grupo, tipo);
                        }
                      }
                      e.target.value = ''; // Resetear el selector
                    }}
                    style={{
                      padding: '0.3rem 0.8rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width:'100%',
                      margin: '0.2rem',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">🎯 Panel de Jueces</option>
                    
                    {/* Opciones de combate */}
                    <optgroup label="🥊 Combate">
                      {llavesCombate.map((grupo, index) => (
                        <option key={`combate-${index}`} value={`combate-${index}`}>
                          {grupo.grupo} ({grupo.competidores?.length || 0} comp.)
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Opciones de forma */}
                    <optgroup label="🧘 Forma">
                      {llavesForma.map((grupo, index) => (
                        <option key={`forma-${index}`} value={`forma-${index}`}>
                          {grupo.grupo} ({grupo.competidores?.length || 0} comp.)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Lista de llaves disponibles con información de competidores */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Llaves disponibles:
                  </div>
                  
                  {/* Llaves de combate */}
                  {llavesCombate.slice(0, 2).map((grupo, index) => {
                    const infoComp = obtenerInfoCompetidores(grupo);
                    return (
                      <div 
                        key={`combate-${index}`} 
                        style={{ 
                          background: '#e7f3ff', 
                          padding: '0.5rem', 
                          margin: '0.3rem 0',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => mostrarDetallesLlave(grupo, 'combate')}
                        title="Click para ver detalles"
                      >
                        <div style={{ color: '#0056b3', fontWeight: 'bold' }}>
                          🥊 {grupo.grupo}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {infoComp.total} competidores • {grupo.competidores?.[0]?.categoria || 'Sin categoría'}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Llaves de forma */}
                  {llavesForma.slice(0, 2).map((grupo, index) => {
                    const infoComp = obtenerInfoCompetidores(grupo);
                    return (
                      <div 
                        key={`forma-${index}`} 
                        style={{ 
                          background: '#fff3cd', 
                          padding: '0.5rem', 
                          margin: '0.3rem 0',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => mostrarDetallesLlave(grupo, 'forma')}
                        title="Click para ver detalles"
                      >
                        <div style={{ color: '#856404', fontWeight: 'bold' }}>
                          🧘 {grupo.grupo}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {infoComp.total} competidores • {grupo.competidores?.[0]?.categoria || 'Sin categoría'}
                        </div>
                      </div>
                    );
                  })}
                  
                  {(llavesCombate.length > 2 || llavesForma.length > 2) && (
                    <div style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                      ...y {Math.max(0, llavesCombate.length - 2) + Math.max(0, llavesForma.length - 2)} llaves más disponibles
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        <div className="botones-container">
          <button className="btn-volver" onClick={volverAlMenu}>Volver al menú</button>
        </div>
    </div>
  );
}

export default TatamisDashboard;