import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./TatamiView.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

  const TatamiViewUnificado = ({ medicalTime, setMedicalTime }) => {

  const [ganadores, setGanadores] = useState({});
  const [ganadoresCompletos, setGanadoresCompletos] = useState([]);
  const [notificacionGanador, setNotificacionGanador] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(0);
  // 🏆 Estado para guardar el ganador actual
  const [ganadorActual, setGanadorActual] = useState(null);
  const [descansoTime, setDescansoTime] = useState(false);
  const [tiempoDescanso, setTiempoDescanso] = useState(30);
  const [timerDescanso, setTimerDescanso] = useState(0);
  const intervaloDescansoRef = useRef(null);


  // -------------------
  // 🔹 LEER tatamiId DESDE URL
  // -------------------
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dnis = searchParams.get("dnis")?.split(",") || [];
  const mode = searchParams.get("mode") || "combate";
  const tatamiId = searchParams.get("id") || "0";  // <-- NUEVO
  const [dnisState, setDnisState] = useState(dnis);
  // -------------------
  // Función para obtener ganadores
  // -------------------

  // Función para obtener información completa de ganadores
  const fetchGanadoresCompletos = async () => {
    try {
      const response = await fetch(`/ganadores-completos?tatami=${tatamiId+1}`);

      const data = await response.json();
      setGanadoresCompletos(data);
    } catch (error) {
      console.error("Error fetching ganadores completos:", error);
    }
  };

  // Detectar nuevos ganadores para mostrar notificaciones
  const detectarNuevosGanadores = (nuevosGanadores) => {
    let ganadorMasReciente = null;
    let maxTimestamp = 0;

    for (const grupo in nuevosGanadores) {
      for (const etapa in nuevosGanadores[grupo]) {
        const ganador = nuevosGanadores[grupo][etapa];
        if (ganador.timestamp > maxTimestamp && ganador.timestamp > ultimaActualizacion) {
          maxTimestamp = ganador.timestamp;
          ganadorMasReciente = {
            nombre: ganador.nombre,
            grupo,
            etapa,
            modalidad: ganador.modalidad,
            timestamp: ganador.timestamp
          };
        }
      }
    }

    if (ganadorMasReciente) {
      setNotificacionGanador(ganadorMasReciente);
      setUltimaActualizacion(maxTimestamp);
      setTimeout(() => setNotificacionGanador(null), 5000);

      fetchGanadoresCompletos();
    }
  };

  // -------------------
  // ESTADOS
  // -------------------

  const [totalAzul, setTotalAzul] = useState(0);
  const [totalRojo, setTotalRojo] = useState(0);
  const [ultimoPrefix, setUltimoPrefix] = useState("");
  const [claseBoton, setClaseBoton] = useState("");
  const [colorJugador, setColorJugador] = useState("");

  const [varActivadora, setVarActivadora] = useState(false);

  const [resultado1, setResultado1] = useState(0);
  const [resultado2, setResultado2] = useState(0);
  const [reinicio, setReinicio] = useState(false);

  const [competidorId, setCompetidorId] = useState(null);
  const [competidorNombre, setCompetidorNombre] = useState("");
  const [competidorPuntos, setCompetidorPuntos] = useState(0);

  // Recalcular resultados
  const [puntajes, setPuntajes] = useState({
    A: { rojo: 0, azul: 0 },
    B: { rojo: 0, azul: 0 },
    C: { rojo: 0, azul: 0 },
    D: { rojo: 0, azul: 0 },
  });

// 🧠 Guarda el último JSON recibido (comparación completa)
const ultimaSenalRef = useRef(null);

const manejarSenal = (data) => {
  if (!data) return;

  // Convertimos a string para comparar fácilmente todo el objeto
  const actualStr = JSON.stringify(data);
  const ultimaStr = ultimaSenalRef.current;

  // ⚠️ Si es exactamente igual al anterior, salimos (no sumar)
  if (ultimaStr === actualStr) {
    // console.log("⏸ Señal repetida, no se suma");
    return;
  }

  // ✅ Guardamos esta señal como la última
  ultimaSenalRef.current = actualStr;

  // Extraemos datos
  const prefix = data.tipo || "";
  const color = data.competidorColor?.toLowerCase() || "";
  const puntos = data.competidorPuntos || 0;

  if (!prefix || !color || puntos === 0) return;

  // ✅ Ahora sí, solo sumamos si hay cambio real
  setPuntajes(prev => ({
    ...prev,
    [prefix]: {
      ...prev[prefix],
      [color]: (prev[prefix]?.[color] || 0) + puntos,
    },
  }));
};

useEffect(() => {
  const obtenerDatosTatami = async () => {
    try {
      const res = await fetch(`/api/valores/controles?tatami=${tatamiId}`);
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) return;

      console.log("📥 Datos del tatami recibidos:", data);
      manejarSenal(data);
    } catch (error) {
      console.error("❌ Error al obtener datos del tatami:", error);
    }
  };

  obtenerDatosTatami();
  const intervalo = setInterval(obtenerDatosTatami, 2000);
  return () => clearInterval(intervalo);
}, [tatamiId]);



useEffect(() => {
  let r1 = 0;
  let r2 = 0;

  // 🟦 JUEZ A
  if ((puntajes.A?.rojo > 0) || (puntajes.A?.azul > 0)) {
    if (puntajes.A?.rojo > puntajes.A?.azul) r1++;
    else if (puntajes.A?.azul > puntajes.A?.rojo) r2++;
  }

  // 🟥 JUEZ B
  if ((puntajes.B?.rojo > 0) || (puntajes.B?.azul > 0)) {
    if (puntajes.B?.rojo > puntajes.B?.azul) r1++;
    else if (puntajes.B?.azul > puntajes.B?.rojo) r2++;
  }

  // 🟩 JUEZ C
  if ((puntajes.C?.rojo > 0) || (puntajes.C?.azul > 0)) {
    if (puntajes.C?.rojo > puntajes.C?.azul) r1++;
    else if (puntajes.C?.azul > puntajes.C?.rojo) r2++;
  }

  // 🟨 JUEZ D (solo si es modo combate)
  //if (modoActual === "combate") {
    if ((puntajes.D?.rojo > 0) || (puntajes.D?.azul > 0)) {
      if (puntajes.D?.rojo > puntajes.D?.azul) r1++;
      else if (puntajes.D?.azul > puntajes.D?.rojo) r2++;
    }

  // 📊 Actualizar resultados globales
  setResultado1(r1);
  setResultado2(r2);
}, [puntajes]);

  const [competidores, setCompetidores] = useState([]);
  const [fotoperfil, setFotoperfil] = useState(null);
  const [modoActual, setModoActual] = useState(mode);

useEffect(() => {
  const obtenerDatos = async () => {
    try {
      const res = await fetch(`/api/valores/panel?tatami=${tatamiId}`);
      const data = await res.json();
      console.log("🔍 DEBUG - Datos recibidos:", data);
      
      // Solo actualizar medicalTime y varActivadora
      if (data.medicalTime !== undefined) {
        setMedicalTime(data.medicalTime);
      }
      
      setVarActivadora(data.varActivadora);
      
      // 🔥 NUEVA LÓGICA PARA DESCANSO - Solo actuar cuando hay CAMBIO
      if (data.descansoTime !== undefined) {
        const descansoCambio = data.descansoTime !== descansoTime;
        const tiempoCambio = data.tiempoDescanso !== tiempoDescanso;
        
        if (descansoCambio || tiempoCambio) {
          console.log("🎯 CAMBIO DETECTADO - descansoTime:", data.descansoTime, "tiempoDescanso:", data.tiempoDescanso);
          
          setDescansoTime(data.descansoTime);
          
          if (data.descansoTime && data.tiempoDescanso) {
            console.log("🚀 INICIANDO NUEVO TIMER:", data.tiempoDescanso, "segundos");
            setTiempoDescanso(data.tiempoDescanso);
            setTimerDescanso(data.tiempoDescanso);
            iniciarTimerDescanso(data.tiempoDescanso);
          } else if (!data.descansoTime && descansoCambio) {
            console.log("🛑 DETENIENDO TIMER - descanso desactivado");
            detenerTimerDescanso();
            setTimerDescanso(0);
          }
        }
      }
      
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  };
  
  obtenerDatos();
  const intervalo = setInterval(obtenerDatos, 2000);
  return () => clearInterval(intervalo);
}, [tatamiId, setMedicalTime, descansoTime, tiempoDescanso]);

  // -------------------------------
  // FUNCIONES DEL TIMER DE DESCANSO
  // -------------------------------
const iniciarTimerDescanso = (segundosIniciales) => {
  // Solo iniciar si no hay timer activo
  if (intervaloDescansoRef.current) {
    console.log("⏱️ Timer ya activo, no se reinicia");
    return;
  }
  
  console.log("🚀 INICIANDO TIMER DE DESCANSO:", segundosIniciales, "segundos");
  setTimerDescanso(segundosIniciales);
  
  intervaloDescansoRef.current = setInterval(() => {
    setTimerDescanso(prev => {
      if (prev <= 1) {
        console.log("⏰ TIMER TERMINADO");
        detenerTimerDescanso();
        // Auto-desactivar cuando llegue a 0
        setDescansoTime(false);
        return 0;
      }
      console.log("⏱️ Timer countdown:", prev - 1);
      return prev - 1;
    });
  }, 1000);
};

const detenerTimerDescanso = () => {
  if (intervaloDescansoRef.current) {
    console.log("🛑 DETENIENDO TIMER DE DESCANSO");
    clearInterval(intervaloDescansoRef.current);
    intervaloDescansoRef.current = null;
  }
};

  const formatoDescanso = (segundos) => {
    const min = String(Math.floor(segundos / 60)).padStart(2, "0");
    const seg = String(segundos % 60).padStart(2, "0");
    return `${min}:${seg}`;
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      detenerTimerDescanso();
    };
  }, []);

  // Cronómetro médico useEffect
  const inicialesCombate = [120, 15, 15];
  const inicialesFormas = [120, 0, 0];
  const [tiempos, setTiempos] = useState(modoActual === "combate" ? inicialesCombate : inicialesFormas);
  const intervalos = useRef([null, null, null]);

  const [ampliado, setAmpliado] = useState(false);

  const formato = (segundos) => {
    const min = String(Math.floor(segundos / 60)).padStart(2, "0");
    const seg = String(segundos % 60).padStart(2, "0");
    return segundos > 0 ? `${min}:${seg}` : "¡Tiempo!";
  };

  const toggleTimer = () => { if (!medicalTime) setRunning(prev => !prev); };
  const resetTimer = () => { setRunning(false); setTime(0); };
  const toggleMedicalTime = () => { setMedicalTime(prev => !prev); if (!medicalTime) setRunning(false); };
  /*const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };*/

  // Efecto para cambiar entre modos
  useEffect(() => {
    setModoActual(mode);
    if (mode === "combate") {
      setTiempos([...inicialesCombate]);
    } else {
      setTiempos([...inicialesFormas]);
    }
    intervalos.current.forEach(intervalo => {
      if (intervalo) clearInterval(intervalo);
    });
    intervalos.current = [null, null, null];
    setAmpliado(false);
  }, [mode]);


  const resetearPuntos = async () => {
    try {
      const res = await fetch("/api/reset", {
        method: "POST"
      });
      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Error al resetear puntos:", error);
    }
  };
  // Agrega esta función en TatamiViewUnificado para debug
useEffect(() => {
  console.log("🕒 Estado actual del timer:", {
    tiempoPrincipal: tiempos[0],
    estaEjecutandose: intervalos.current[0] !== null,
    medicalTime: medicalTime,
    varActivadora: varActivadora
  });
}, [tiempos[0], medicalTime, varActivadora]);

useEffect(() => {
  console.log("🔄 Control combate - varActivadora:", varActivadora, "medicalTime:", medicalTime);
  
  // 1. INICIAR COMBATE (solo si no hay tiempo médico)
  if (varActivadora === true && !medicalTime) {
    console.log("🎬 INICIANDO COMBATE");
    
    // ✅ Asegurar que el timer tenga tiempo suficiente antes de iniciar
    setTiempos(prev => {
      if (prev[0] <= 10) {
        console.log("🔄 Timer bajo, reseteando a valor por defecto");
        return [120, prev[1], prev[2]]; // Reset a 2 minutos
      }
      console.log(`✅ Iniciando combate con ${prev[0]} segundos`);
      return prev;
    });
    
    // ✅ Pequeño delay para asegurar la actualización del estado
    setTimeout(() => {
      iniciarPrimerTemporizador();
    }, 100);
  }
  
  // 2. PAUSAR COMBATE
  if (varActivadora === false) {
    console.log("⏸️ PAUSANDO COMBATE");
    pausarPrimerTemporizador();
  }
  
  // 3. CONTROL DE TIEMPO MÉDICO
  if (medicalTime === true) {
    console.log("🏥 TIEMPO MÉDICO ACTIVADO");
    pausarPrimerTemporizador();
  }
}, [varActivadora, medicalTime]);

  // Temporizador principal
  const iniciarPrimerTemporizador = () => {
    if (intervalos.current[0] || tiempos[0] <= 0) return;

    intervalos.current[0] = setInterval(() => {
      setTiempos(prevTiempos => {
        const nuevos = [...prevTiempos];
        nuevos[0] = nuevos[0] - 1;
        
        if (nuevos[0] <= 0) {
          clearInterval(intervalos.current[0]);
          intervalos.current[0] = null;
          
          // NUEVO: Iniciar automáticamente los temporizadores secundarios
          if (modoActual === "combate" && nuevos[0] === 0) {
            iniciarOtrosTemporizadores();
          }
          
          if (nuevos.every(t => t <= 0)) setAmpliado(false);
        }
        return nuevos;
      });
    }, 1000);
    setAmpliado(true);
  };
  const ReiniciarPrimerTemporizador = () => {
  pausarPrimerTemporizador();
  pausarOtrosTemporizadores();
  setTiempos(modoActual === "combate" ? [...inicialesCombate] : [...inicialesFormas]);
  setAmpliado(false);
  };

  const pausarPrimerTemporizador = () => {
    if (intervalos.current[0]) {
      clearInterval(intervalos.current[0]);
      intervalos.current[0] = null;
    }
    setAmpliado(false);
  };

  //determinar ganadou

const determinarPuntos = () => {
  let nombreCom1 = "";
  let nombreCom2 = ""; 
  let puntosCom1 = 0;
  let puntosCom2 = 0;

  if (competidorId === "0") {
    puntosCom1 = competidorPuntos;
    nombreCom1 = competidorNombre;
  } 
  if (competidorId === "1") {
    puntosCom2 = competidorPuntos;
    nombreCom2 = competidorNombre;
  }

  console.log("Competidor 1:", nombreCom1, "Puntos:", puntosCom1);
  console.log("Competidor 2:", nombreCom2, "Puntos:", puntosCom2);
};//(Lucas: tarjetas que muestren los puntos y quien gano)

useEffect(() => {
  determinarPuntos(); // ✅ ahora sí se ejecuta
}, [competidorId, competidorNombre, competidorPuntos]);

//UseEfect para mantener dnis actualizados y podes rotar competidores
{/*const pasarProximoCombate = () => {
    setDnisState(prev => {
      if (prev.length < 4) return prev;
      const nuevo = [...prev];
      [nuevo[1], nuevo[3]] = [nuevo[3], nuevo[1]];
      [nuevo[2], nuevo[0]] = [nuevo[0], nuevo[2]];
      return nuevo;
    });
    ReiniciarPrimerTemporizador();
    resetearPuntos();
  };*/}

const [proximoCombate, setProximoCombate] = useState(false);

// Efecto que se ejecuta cuando proximoCombate cambia a true
// Agregar este useEffect para detectar próximo combate
useEffect(() => {
  const detectarProximoCombate = async () => {
    try {
      const res = await fetch(`/api/valores/panel?tatami=${tatamiId}`);
      const data = await res.json();
      
      console.log("🔄 Detectando próximo combate:", data);
      
      if (data.proximoCombate === true) {
        console.log("🎯 Señal de próximo combate detectada - Rotando competidores");
        
        // Ejecutar rotación
        if (dnisState.length >= 4) {
          const nuevo = [...dnisState];
          [nuevo[1], nuevo[3]] = [nuevo[3], nuevo[1]];
          [nuevo[2], nuevo[0]] = [nuevo[0], nuevo[2]];
          
          setDnisState(nuevo);
          ReiniciarPrimerTemporizador();
          resetearPuntos();
          
          // Resetear la señal en el backend (opcional)
          fetch("/api/enviar/panel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              tatamiId: tatamiId,
              proximoCombate: false,  // ← Resetear señal
              accion: 'reset_proximo_combate'
            })
          });
        }
      }
    } catch (error) {
      console.error("Error detectando próximo combate:", error);
    }
  };

  const intervalo = setInterval(detectarProximoCombate, 2000);
  return () => clearInterval(intervalo);
}, [tatamiId, dnisState]);

// Y luego en tu código llamas:
// setProximoCombate(true); en lugar de pasarProximoCombate()

useEffect(() => {
  if (dnisState.length > 0) {
    fetch(`/api/competidores/by-dni?dnis=${dnisState.join(",")}`)
      .then(res => res.json())
      .then(data => {
        // Ordenar según dnisState
        const ordenados = dnisState.map(dni => data.find(c => c.dni === dni));
        setCompetidores(ordenados);
      })
      .catch(() => setCompetidores([]));
  }
}, [dnisState]);

// ✅ REEMPLAZA este useEffect con la versión corregida
useEffect(() => {
  const obtenerConfiguracionTimer = async () => {
    try {
      const res = await fetch(`/api/tiempo-central?tatami=${tatamiId}`);
      if (!res.ok) return;
      
      const data = await res.json();
      
      if (data.minutos !== undefined) {
        setTiempos(prev => {
          // ⚠️ NO actualizar si el timer está en ejecución
          const timerEnEjecucion = intervalos.current[0] !== null;
          if (timerEnEjecucion) {
            return prev;
          }
          
          // ⚠️ Solo actualizar si el valor es diferente y razonable
          const nuevosSegundos = data.minutos * 60;
          if (nuevosSegundos === prev[0]) {
            return prev; // Mismo valor, no actualizar
          }
          
          // ✅ Actualizar solo si es una configuración válida
          if (nuevosSegundos >= 60 && nuevosSegundos <= 120) { 
            console.log(`✅ Timer configurado desde backend: ${data.minutos} min`);
            const nuevos = [...prev];
            nuevos[0] = nuevosSegundos;
            return nuevos;
          }
          
          return prev;
        });
      }
    } catch (error) {
      console.error("❌ Error obteniendo configuración timer:", error);
    }
  };

  // Solo verificar cada 3 segundos, no tan frecuente
  const intervalo = setInterval(obtenerConfiguracionTimer, 3000);
  return () => clearInterval(intervalo);
}, [tatamiId]);

  // Temporizadores secundarios
  const iniciarOtrosTemporizadores = () => {
    if (modoActual !== "combate") return;
    
    [1, 2].forEach(i => {
      if (intervalos.current[i] || tiempos[i] <= 0) return;

      intervalos.current[i] = setInterval(() => {
        setTiempos(prevTiempos => {
          const nuevos = [...prevTiempos];
          nuevos[i] = nuevos[i] - 1;
          if (nuevos[i] <= 0) {
            clearInterval(intervalos.current[i]);
            intervalos.current[i] = null;
            if (nuevos.every(t => t <= 0)) setAmpliado(false);
          }
          return nuevos;
        });
      }, 1000);
    });
  };

  const pausarOtrosTemporizadores = () => {
    if (modoActual !== "combate") return;
    
    [1, 2].forEach(i => {
      if (intervalos.current[i]) {
        clearInterval(intervalos.current[i]);
        intervalos.current[i] = null;
      }
    });
  };
  const mostrarPuntos = (juezNumero, color) => {
    // Si el último golpe corresponde a este juez y color, mostrar puntos
    if (ultimoPrefix === String.fromCharCode(64 + juezNumero) && colorJugador === color) {
      return puntos;
    }
    // Si no, mostrar 0 o el valor acumulado que quieras
    return 0;
  };

      // -------------------------------------------------
    // Calcula la diferencia por juez y devuelve objeto
    // -------------------------------------------------
    const calcularDiferencia = (juez) => {
      const rojo = puntajes[juez]?.rojo || 0;
      const azul = puntajes[juez]?.azul || 0;
      const diferencia = Math.abs(rojo - azul);
      if (diferencia === 0) return null;
      return {
        ganador: rojo > azul ? "rojo" : "azul",
        diferencia
      };
    };

  return (
    <>
  {/* Barra de texto desplazándose|Que mas hay que mostrar?*/}
<div className="barra-infinita">
  <div className="contenedor-textos">
    <span>🔥 EN COMBATE: {competidores[0]?.nombre || "Competidor 2"} vs {competidores[1]?.nombre || "Competidor 3"} 🔥</span>
    <span>🏆 PRÓXIMO: {competidores[2]?.nombre || "Esperando"} vs {competidores[3]?.nombre || "Esperando"} 🏆</span>
    <span>⏰ Tiempo: {formato(tiempos[0])} ⏰</span>
    <span>📢 Torneo de Taekwondo 2025 📢</span>
    <span>🎯 Modo: {modoActual === "combate" ? "Combate" : "Formas"} 🎯</span>
  </div>
</div>
      <div className="container-foto" />
      <div className="background">
        <div className="modo-indicador">
          Modo: {modoActual === "combate" ? "Combate" : "Formas"}
        </div>

    {notificacionGanador && (
        <div className="notificacion-ganador">
          <div className="ganador-content">
            <h3>🎉 ¡GANADOR SELECCIONADO! 🎉</h3>
            <p><strong>{notificacionGanador.nombre}</strong></p>
            <p>Grupo: {notificacionGanador.grupo} - {notificacionGanador.modalidad}</p>
            <button onClick={() => setNotificacionGanador(null)} className="cerrar-notificacion">
              ×
            </button>
          </div>
        </div>
      )}
        {medicalTime && (
          <div className="medical-time-overlay">
            <div className="medical-time-modal">
              <div className="medical-time-content">
                <h2>🏥 TIEMPO MÉDICO</h2>
                <p>Combate en pausa</p>
              </div>
            </div>
          </div>
        )}        
    {/* NUEVO MODAL DE DESCANSO */}
        {descansoTime && (
          <div className="descanso-overlay">
            <div className="descanso-modal">
              <div className="descanso-content">
                <h2>⏱️ TIEMPO DE DESCANSO</h2>
                <div className="descanso-timer">
                  {formatoDescanso(timerDescanso)}
                </div>
                <p>El combate se reanudará automáticamente</p>
                <div className="descanso-progress">
                  <div 
                    className="descanso-progress-bar"
                    style={{
                      width: `${((tiempoDescanso - timerDescanso) / tiempoDescanso) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="dnis-tatami">
        <strong>Competidores en combate:</strong>{" "}
        {competidores.length > 0
          ? `${competidores[1]?.nombre || ""} vs ${competidores[3]?.nombre || ""}`
          : dnisState.join(" - ")}
      </div>
        
        <div className="Cartas-presentacion">
  {ganadorActual === null && (
    <>
      {/* Mostrar ambos competidores mientras no haya ganador */}
      <div className="cardpresentation-container">
        <div className="top-panel"></div>
        <div className="character-image">
          <img src={`uploads/${competidores[0]?.fotoPerfil}`} alt="Competidor A" />
        </div>
        <div className="cardpresentation-content">{competidores[0]?.nombre || "Competidor A"}</div>
      </div>

      <div className="cardpresentation-container2">
        <div className="top-panel-2"></div>
        <div className="character-image-2">
          <img src={`uploads/${competidores[1]?.fotoPerfil}`} alt="Competidor B" />
        </div>
        <div className="cardpresentation-content2">{competidores[1]?.nombre || "Competidor B"}</div>
      </div>
    </>
  )}

  {ganadorActual && (
    <div className="cardpresentation-ganador">
      <div className="top-panel-ganador"></div>
      <div className="character-image-ganador">
        <img
          src={
            ganadorActual === "rojo"
              ? `/uploads/${competidores[0]?.fotoPerfil}`
              : `/uploads/${competidores[1]?.fotoPerfil}`
          }
          alt="Ganador"
        />
      </div>
      <div className="cardpresentation-content-ganador">
        🏆 {ganadorActual === "rojo"
          ? competidores[0]?.nombre
          : competidores[1]?.nombre} 🏆
      </div>
    </div>
  )}
</div>

        
        <div className="contadores">
          <div className="card3">
            <div className="timer-principal">{formato(tiempos[0])}</div>
          </div>

            <div className="card-box">
              <div className={`card ${ampliado ? "ampliado" : ""}`}>
                <h2 id="totalA" className="resultado">{resultado2}</h2>
              </div>
              <div className={`card2 ${ampliado ? "ampliado" : ""}`}>
                <h2 id="totalB" className="resultado">{resultado1}</h2>
              </div>
            </div>

            
            {/*Nuevos contadores de Jueces*/}
    <div className="contador-j1">
      <div className="juez-1"><h2>Juez 1</h2></div>
      {calcularDiferencia("A") && (
        <div className={`diferencia-box ${calcularDiferencia("A").ganador}`}>
          {calcularDiferencia("A").diferencia}
        </div>
      )}
    </div>


    <div className="contador-j2">
      <div className="juez-1"><h2>Juez 2</h2></div>
      {calcularDiferencia("B") && (
        <div className={`diferencia-box ${calcularDiferencia("B").ganador}`}>
          {calcularDiferencia("B").diferencia}
        </div>
      )}
    </div>

    <div className="contador-j3">
      <div className="juez-1"><h2>Juez 3</h2></div>
      {calcularDiferencia("C") && (
        <div className={`diferencia-box ${calcularDiferencia("C").ganador}`}>
          {calcularDiferencia("C").diferencia}
        </div>
      )}
    </div>

    <div className="contador-j4">
      <div className="juez-1"><h2>Juez 4</h2></div>
      {calcularDiferencia("D") && (
        <div className={`diferencia-box ${calcularDiferencia("D").ganador}`}>
          {calcularDiferencia("D").diferencia}
        </div>
      )}
    </div>
</div>
   
   
   {/*Nuevo--Proximos competidores*/}
    <div className="abajo">
      <div className="blink">
        <div className="kanji">
          {/* Competidor de la izquierda */}
          <div className="competidor-espera">
            <div className="competidor-foto">
              <img
                src={competidores[2]?.fotoPerfil
                  ? `/uploads/${competidores[2].fotoPerfil}`
                  : "./assets/avatar-default.png"}
                alt={competidores[2]?.nombre || "Foto"}
              />
            </div>
            <div className="competidor-nombre">
              {competidores[2]?.nombre || "Esperando"}
            </div>
          </div>
        </div>
        
        <div className="proximo-combate">
          <h2>Próximo Combate</h2>
        </div> 
        <div className="kanji">
          <div className="competidor-espera">
            <div className="competidor-foto">
              <img
                src={competidores[3]?.fotoPerfil
                  ? `/uploads/${competidores[3].fotoPerfil}`
                  : "./assets/avatar-default.png"}
                alt={competidores[3]?.nombre || "Foto"}
              />
            </div>
            <div className="competidor-nombre">
              {competidores[3]?.nombre || "Esperando"}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</> 
  );
};

export default TatamiViewUnificado;