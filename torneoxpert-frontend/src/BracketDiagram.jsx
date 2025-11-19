import React from "react";
import "./BracketDiagram.css";



const limpiarRuta = (ruta) => {
  if (!ruta) return "";
  // elimina repeticiones de /uploads/ y elimina slashes iniciales dobles
  const clean = ruta.replace(/\/uploads\/+/g, "/uploads/").replace(/^\/+/, "/");
  return clean;
};

const BOX_WIDTH = 250;
const BOX_HEIGHT = 50;
const VERTICAL_SPACING = 30;
const HORIZONTAL_SPACING = 180;

const BracketDiagram = ({ grupo, onAvanzar, onDeshacer }) => {
  const {
    ronda,
    octavos = [],
    cuartos = [],
    semis = [],
    final = [],
    octavos: octavosGanadores = [],
    cuartos: cuartosGanadores = [],
    semis: semisGanadores = [],
    final: finalGanador = null,
    competidores = []
  } = grupo;

  // Calcular número de rondas automáticamente basado en competidores iniciales
  const calcularRondas = () => {
    const competidoresIniciales = ronda?.map(p => [p.a, p.b]).flat().filter(Boolean) || [];
    const totalCompetidores = competidoresIniciales.length;
    
    if (totalCompetidores === 0) return { rounds: [], totalRounds: 0 };

    // Determinar número de rondas según cantidad de competidores
    let totalRounds;
    if (totalCompetidores <= 2) totalRounds = 1;
    else if (totalCompetidores <= 4) totalRounds = 2;
    else if (totalCompetidores <= 8) totalRounds = 3;
    else if (totalCompetidores <= 16) totalRounds = 4;
    else if (totalCompetidores <= 32) totalRounds = 5;
    else totalRounds = 6; // Para torneos más grandes

    // Organizar los datos de cada ronda
    const roundsData = [];
    roundsData[0] = competidoresIniciales; // Ronda inicial

    // Asignar las rondas existentes según corresponda
    if (totalRounds >= 2) roundsData[1] = octavos.length > 0 ? octavos : Array(Math.ceil(competidoresIniciales.length / 2)).fill(null);
    if (totalRounds >= 3) roundsData[2] = cuartos.length > 0 ? cuartos : Array(Math.ceil(competidoresIniciales.length / 4)).fill(null);
    if (totalRounds >= 4) roundsData[3] = semis.length > 0 ? semis : Array(Math.ceil(competidoresIniciales.length / 8)).fill(null);
    if (totalRounds >= 5) roundsData[4] = final.length > 0 ? final : [null];

    return { rounds: roundsData, totalRounds };
  };

  const { rounds, totalRounds } = calcularRondas();

  // Organizar ganadores por ronda
  const roundWinners = [
    octavosGanadores,
    cuartosGanadores, 
    semisGanadores,
    finalGanador ? [finalGanador] : []
  ];

  // Calcular dimensiones dinámicamente
  const calcularDimensiones = () => {
    if (rounds.length === 0) return { svgHeight: 400, calculatedWidth: 800 };

    const totalBoxesPrimeraRonda = rounds[0].length;
    const svgHeight = totalBoxesPrimeraRonda * (BOX_HEIGHT + VERTICAL_SPACING) + 60;
    const calculatedWidth = totalRounds * (BOX_WIDTH + HORIZONTAL_SPACING) + 20;
    
    return { svgHeight, calculatedWidth };
  };

  const { svgHeight, calculatedWidth } = calcularDimensiones();

  // Posiciones dinámicas basadas en número de rondas
  const getBoxPosition = (roundIndex, positionIndex) => {
    const baseY = 20 + (roundIndex * 10); // Pequeño offset vertical por ronda
    
    if (roundIndex === 0) {
      return {
        x: 20,
        y: baseY + positionIndex * (BOX_HEIGHT + VERTICAL_SPACING)
      };
    }

    // Para rondas posteriores, calcular posición basada en el factor de reducción
    const reductionFactor = Math.pow(2, roundIndex);
    const verticalOffset = (BOX_HEIGHT + VERTICAL_SPACING) * reductionFactor / 2;
    
    return {
      x: 20 + (BOX_WIDTH + HORIZONTAL_SPACING) * roundIndex,
      y: baseY + positionIndex * verticalOffset
    };
  };

  // Determinar si debe dibujar línea entre rondas
  const debeDibujarLinea = (rondaIndex, indiceEnRonda) => {
    if (rondaIndex >= roundWinners.length) return false;
    
    const winners = roundWinners[rondaIndex];
    return winners.length > 0 && winners[Math.floor(indiceEnRonda / 2)];
  };

  // Verificar si un competidor es ganador
  const esGanador = (nombre, roundIndex, positionIndex) => {
    if (!nombre || roundIndex >= roundWinners.length) return false;
    
    const winners = roundWinners[roundIndex];
    return winners[Math.floor(positionIndex / 2)] === nombre;
  };

  // Generar líneas de conexión entre rondas
  const generarLineas = () => {
    const lines = [];

    for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex++) {
      const currentRound = rounds[roundIndex];
      
      currentRound.forEach((_, positionIndex) => {
        if (!debeDibujarLinea(roundIndex, positionIndex)) return;

        const startPos = getBoxPosition(roundIndex, positionIndex);
        const endPos = getBoxPosition(roundIndex + 1, Math.floor(positionIndex / 2));
        
        const color = positionIndex % 2 === 0 ? "#1e90ff" : "#e53935";
        
        lines.push({
          x1: startPos.x + BOX_WIDTH,
          y1: startPos.y + BOX_HEIGHT / 2,
          x2: endPos.x,
          y2: endPos.y + BOX_HEIGHT / 2,
          color
        });
      });
    }

    return lines;
  };

  const lines = generarLineas();

 


  // Obtener datos del competidor
  const obtenerDatosCompetidor = (competidor) => {
    if (!competidor) return { nombre: "" };

    let compObj = competidor;
    if (typeof competidor === "string" && Array.isArray(competidores)) {
      compObj = competidores.find(c => c.nombre === competidor) || { nombre: competidor };
    }

    return {
      nombre: compObj.nombre || "",
      imagen: limpiarRuta(compObj.logo_url || compObj.logoEscuela)

    };
  };

  // Obtener clase de color para la caja
  const obtenerClaseColor = (roundIndex, positionIndex, esGanador) => {
    if (esGanador) return "bracket-box winner";
    if (roundIndex === rounds.length - 1) return "bracket-box final";
    
    return positionIndex % 2 === 0 ? "bracket-box blue" : "bracket-box red";
  };

  // Manejador para avanzar competidor
  const manejarAvanzar = (roundIndex, positionIndex, nombre) => {
    if (!nombre) return;

    const etapas = ["octavos", "cuartos", "semis", "final", "campeon"];
    const etapaIndex = Math.min(roundIndex, etapas.length - 1);
    const numeroEnfrentamiento = Math.floor(positionIndex / 2) + 1;
    const etapa = `${etapas[etapaIndex]}${numeroEnfrentamiento}`;

    onAvanzar(grupo.grupo, nombre, etapa);

    // Llamada a la API
    fetch("/api/ganador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        grupo: grupo.grupo, 
        etapa, 
        ganador: nombre, 
        modalidad: grupo.modalidad 
      }),
    });
  };

  // Manejador para deshacer
  const manejarDeshacer = (roundIndex, positionIndex, nombre, e) => {
    e.stopPropagation();
    
    const etapas = ["octavos", "cuartos", "semis", "final"];
    const etapaIndex = Math.min(roundIndex, etapas.length - 1);
    const numeroEnfrentamiento = Math.floor(positionIndex / 2) + 1;
    const etapa = `${etapas[etapaIndex]}${numeroEnfrentamiento}`;

    console.log("🧩 DESHACER CLIC →", {
      grupo: grupo.grupo,
      roundIndex,
      positionIndex,
      etapa,
      nombre
    });

    onDeshacer(grupo.grupo, etapa);
  };

  if (rounds.length === 0) {
    return (
      <div className="bracket-empty">
        <p>No hay competidores en esta llave</p>
      </div>
    );
  }

  return (
    <div className="bracket-container">
      <div className="bracket-header">
        <h3>Llave - {grupo.grupo} ({rounds[0].length} competidores, {totalRounds} rondas)</h3>
      </div>
      
      <svg 
        width="100%" 
        height={svgHeight} 
        viewBox={`0 0 ${calculatedWidth} ${svgHeight}`} 
        preserveAspectRatio="xMinYMin meet"
      >
        {/* Líneas de conexión */}
        {lines.map((line, i) => (
          <path
            key={`line-${i}`}
            d={`M${line.x1},${line.y1} C${(line.x1 + line.x2) / 2},${line.y1} ${(line.x1 + line.x2) / 2},${line.y2} ${line.x2},${line.y2}`}
            stroke={line.color}
            strokeWidth="6"
            fill="none"
          />
        ))}

        {/* Cajas de competidores */}
        {rounds.map((round, roundIndex) =>
          round.map((competidor, positionIndex) => {
            const { nombre, imagen } = obtenerDatosCompetidor(competidor);
            const { x, y } = getBoxPosition(roundIndex, positionIndex);
            const ganador = esGanador(nombre, roundIndex, positionIndex);
            const colorClass = obtenerClaseColor(roundIndex, positionIndex, ganador);

            return (
              <g key={`r${roundIndex}-c${positionIndex}`}>
                <rect
                  x={x}
                  y={y}
                  width={BOX_WIDTH}
                  height={BOX_HEIGHT}
                  className={colorClass}
                  rx="16"
                  ry="16"
                  style={{ cursor: nombre && !ganador ? "pointer" : "default" }}
                  onClick={() => !ganador && manejarAvanzar(roundIndex, positionIndex, nombre)}
                />

                {imagen && (
  <image
    href={imagen}
    x={x + 8}
    y={y}
    width={48}
    height={48}
    onError={e => e.target.remove()}
    style={{ pointerEvents: "none" }}
  />
)}


                <text
                  x={x + BOX_WIDTH / 1.6}
                  y={y + BOX_HEIGHT / 2 + 7}
                  fontSize="20"
                  textAnchor="middle"
                  fill={nombre ? "#000" : "#999"}
                  style={{ fontWeight: "bold", pointerEvents: "none" }}
                >
                  {nombre || "—"}
                </text>

                {ganador && (
                  <g>
                    <circle
                      cx={x + BOX_WIDTH - 15}
                      cy={y + BOX_HEIGHT / 2}
                      r="12"
                      fill="#ff4444"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => manejarDeshacer(roundIndex, positionIndex, nombre, e)}
                    />
                    <text
                      x={x + BOX_WIDTH - 15}
                      y={y + BOX_HEIGHT / 2 + 5}
                      fontSize="16"
                      textAnchor="middle"
                      fill="white"
                      style={{ cursor: "pointer", fontWeight: "bold", pointerEvents: "none" }}
                    >
                      ×
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

export default BracketDiagram;