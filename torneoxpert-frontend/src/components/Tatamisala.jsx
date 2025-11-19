import React, { useState, useEffect } from "react";
import ControlIndividual from "./ControlIndividual";
import { useLocation } from "react-router-dom";

function TatamiSala({ medicalTime, setMedicalTime }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // ✅ Parámetros corregidos
  const juezId = searchParams.get("id"); // A, B, C, D
  const tatamiId = searchParams.get("tatamiId"); // ID del tatami principal
  const competidores = JSON.parse(decodeURIComponent(searchParams.get("competidores") || "[]"));
  const horaReset = searchParams.get("horaReset");
  const combateEstado = searchParams.get("combateEstado");

  // Estados
  const [totalAzul, setTotalAzul] = useState(0);
  const [totalRojo, setTotalRojo] = useState(0);
  const [varActivadora, setVarActivadora] = useState(false);
  const [hora, setHora] = useState(null);
  const [puntosAJugador1, setPuntosAJugador1] = useState(0);
  const [puntosAJugador2, setPuntosAJugador2] = useState(0);
  const [puntosBJugador1, setPuntosBJugador1] = useState(0);
  const [puntosBJugador2, setPuntosBJugador2] = useState(0);
  const [puntosCJugador1, setPuntosCJugador1] = useState(0);
  const [puntosCJugador2, setPuntosCJugador2] = useState(0);
  const [puntosDJugador1, setPuntosDJugador1] = useState(0);
  const [puntosDJugador2, setPuntosDJugador2] = useState(0);

  // ✅ Fetch de datos del tatami principal
  useEffect(() => {
    console.log("🔄 Iniciando fetch de datos para tatami:", tatamiId);
    if (!tatamiId) {
      console.warn("❌ TatamiId no definido");
      return;
    }

        const obtenerDatosTatami = async () => {
      try {
        const res = await fetch(`/api/valores/panel?tatami=${tatamiId}`);
        const data = await res.json();

        if (data) {
          console.log("📥 Datos del tatami recibidos:", data);
          //setTotalAzul(data.total1 || 0);
          //setTotalRojo(data.total2 || 0);
          setVarActivadora(data.varActivadora || false);
        }
      } catch (error) {
        console.error("❌ Error al obtener datos del tatami:", error);
      }
      try {
        const res = await fetch(`/api/valores/controles?tatami=${tatamiId}`);
        const data = await res.json();

        if (data) {
          console.log("📥 Datos del tatami recibidos 2:", data);
          setTotalAzul(data.total1 || 0);
          setTotalRojo(data.total2 || 0);
          //setVarActivadora(data.varActivadora || false);
        }
      } catch (error) {
        console.error("❌ Error al obtener datos del tatami:", error);
      }
    };

    obtenerDatosTatami();
    const intervalo = setInterval(obtenerDatosTatami, 2000);
    return () => clearInterval(intervalo);
  }, [tatamiId]);

  // ✅ Función para manejar señales
  const manejarSenalDesdeJuez = async (puntos, tipo, colorJugador, claseBoton) => {

    //console.log(varActivadora);
    if (!varActivadora) {
      console.log("⏸️ Combate pausado, no se pueden enviar puntos");
      return;
    }

    // Actualizar totales
    const nuevoTotalAzul = colorJugador === "azul" ? totalAzul + puntos : totalAzul;
    const nuevoTotalRojo = colorJugador === "rojo" ? totalRojo + puntos : totalRojo;

    setTotalAzul(nuevoTotalAzul);
    setTotalRojo(nuevoTotalRojo);

    // Actualizar puntos por juez
    let nuevoAJugador1 = puntosAJugador1;
    let nuevoAJugador2 = puntosAJugador2;
    let nuevoBJugador1 = puntosBJugador1;
    let nuevoBJugador2 = puntosBJugador2;
    let nuevoCJugador1 = puntosCJugador1;
    let nuevoCJugador2 = puntosCJugador2;
    let nuevoDJugador1 = puntosDJugador1;
    let nuevoDJugador2 = puntosDJugador2;

    // --- 👇 Acumuladores por juez ---
    if (juezId === "A") {
      if (colorJugador === "azul") {
        nuevoAJugador1 += puntos;
        setPuntosAJugador1(nuevoAJugador1);
      } else {
        nuevoAJugador2 += puntos;
        setPuntosAJugador2(nuevoAJugador2);
      }
    }

    if (juezId === "B") {
      if (colorJugador === "azul") {
        nuevoBJugador1 += puntos;
        setPuntosBJugador1(nuevoBJugador1);
      } else {
        nuevoBJugador2 += puntos;
        setPuntosBJugador2(nuevoBJugador2);
      }
    }

    if (juezId === "C") {
      if (colorJugador === "azul") {
        nuevoCJugador1 += puntos;
        setPuntosCJugador1(nuevoCJugador1);
      } else {
        nuevoCJugador2 += puntos;
        setPuntosCJugador2(nuevoCJugador2);
      }
    }

    if (juezId === "D") {
      if (colorJugador === "azul") {
        nuevoDJugador1 += puntos;
        setPuntosDJugador1(nuevoDJugador1);
      } else {
        nuevoDJugador2 += puntos;
        setPuntosDJugador2(nuevoDJugador2);
      }
    }

    // --- Determinar juez ---
    let VarA = 0, VarB = 0, VarC = 0, VarD = 0;
    switch (juezId) {
      case "A": VarA = 1; break;
      case "B": VarB = 1; break;
      case "C": VarC = 1; break;
      case "D": VarD = 1; break;
    }
    // Preparar datos para enviar
    const datos = {
      tipo: juezId,
      tatamiId: tatamiId,
      clase: claseBoton,
      total1: nuevoTotalAzul,
      total2: nuevoTotalRojo,
      competidorNombre: colorJugador === "azul" ? competidores[0]?.nombre || "Jugador 1" : competidores[1]?.nombre || "Jugador 2",
      competidorColor: colorJugador,
      competidorPuntos: puntos,
      VarA: juezId === "A" ? 1 : 0,
      VarB: juezId === "B" ? 1 : 0,
      VarC: juezId === "C" ? 1 : 0,
      VarD: juezId === "D" ? 1 : 0,
      hora: horaReset,
      juezId: juezId,
      estadoCombate: combateEstado,
      puntosAJugador1: nuevoAJugador1,
      puntosAJugador2: nuevoAJugador2,
      puntosBJugador1: nuevoBJugador1,
      puntosBJugador2: nuevoBJugador2,
      puntosCJugador1: nuevoCJugador1,
      puntosCJugador2: nuevoCJugador2,
      puntosDJugador1: nuevoDJugador1,
      puntosDJugador2: nuevoDJugador2,
    };

    console.log("📤 Enviando puntos desde juez:", datos);

    try {
      const res = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const data = await res.json();
      console.log("✅ Puntos enviados correctamente:", data);
    } catch (err) {
      console.error("❌ Error enviando puntos:", err);
    }
  };

  return (
    <div className="tatami-sala">
      <h2>Control de Juez {juezId} - Tatami {tatamiId}</h2>
      
      {/* Información del combate */}
      <div className="info-combate">
        <p><strong>Estado:</strong> {combateEstado === "iniciado" ? "🟢 En curso" : "⏸️ Pausado"}</p>
        <p><strong>Competidores:</strong> {competidores[0]?.nombre || "Azul"} vs {competidores[1]?.nombre || "Rojo"}</p>
        <p><strong>Totales:</strong> Azul: {totalAzul} | Rojo: {totalRojo}</p>
      </div>

      <div className="controles-grid">
        <ControlIndividual 
          onEnviarSenal={manejarSenalDesdeJuez}
          juezId={juezId}
          //juezId={juezId}
          varActivadora={varActivadora}
        />
      </div>

      {/* Mostrar puntos por juez 
      <div className="puntos-jueces">
        <h3>Puntos asignados por Juez {juezId}:</h3>
        <p>{competidores[0]?.nombre || "Azul"}: {puntosPorJuez[juezId]?.jugador1 || 0}</p>
        <p>{competidores[1]?.nombre || "Rojo"}: {puntosPorJuez[juezId]?.jugador2 || 0}</p>
      </div>*/}
    </div>
  );
}

export default TatamiSala;