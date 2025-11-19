import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BracketDiagram from "./BracketDiagram";
import "./Llaves.css";


export default function Llaves({ brackets: bracketsProp, onDelete, modo }) {
  const [brackets, setBrackets] = useState(bracketsProp || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (bracketsProp) setBrackets(bracketsProp);
  }, [bracketsProp]);

  const fetchBrackets = () => {
    const url =
      modo === "forma"
        ? "/api/brackets-forma"
        : "/api/brackets";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setBrackets(data.brackets || []));
  };

  const avanzar = async (grupo, nombre, etapa) => {
    if (!etapa) return;
    fetchBrackets();
  };

  const deshacer = async (grupo, etapa) => {
    await fetch(`/api/ganador?grupo=${grupo}&etapa=${etapa}`, {
      method: "DELETE",
    });
    fetchBrackets();
  };

  // Mover competidor a otro grupo usando backend
  const moverCompetidor = (competidorId, grupoOrigen, grupoDestino) => {
    if (!grupoDestino) return;

    // Busca el grupo destino en brackets para obtener sus datos
    const grupoDestinoObj = brackets.find(g => g.grupo === grupoDestino);
    if (!grupoDestinoObj) return;

    // Toma los datos relevantes del primer competidor del grupo destino
    const datosDestino = grupoDestinoObj.competidores[0];
    if (!datosDestino) return;

    // Prepara los datos para enviar al backend
    const grupoDestinoDatos = {
      genero: datosDestino.genero,
      graduacion: datosDestino.graduacion,
      edad: datosDestino.edad,
      peso: datosDestino.peso,
      categoria: datosDestino.categoria
    };

    fetch("/api/competidores/mover-competidor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competidorId, grupoDestinoDatos }),
    })
      .then(() => {
        fetchBrackets();
      });
  };

  return (
    <div className="llaves-container">
      <h2 className="llaves-titulo">Llaves de combate</h2>
      {brackets.map((grupo) => (
        <div key={grupo.grupo} className="grupo-container">
          <h3 className="grupo-titulo">{grupo.grupo}</h3>
          <BracketDiagram
            grupo={grupo}
            onAvanzar={avanzar}
            onDeshacer={deshacer}
          />

          <ul className="lista-competidores">
            {grupo.competidores &&
              grupo.competidores.map((c) => (
                <li key={c.id} className="item-competidor">
                  <span
                    className="info-competidor"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {c.logoEscuela && (
  <img
    src={
  c.logoEscuela?.startsWith("http")
    ? c.logoEscuela
    : c.logoEscuela   // YA VIENE CON /uploads
}

    
    style={{
      width: 30,
      height: 30,
      objectFit: "contain",
      borderRadius: 4,
    }}
    onError={(e) => e.currentTarget.remove()}
    alt=""
  />
)}

                    <span>
                      {c.nombre} ({c.graduacion} - {c.categoria})
                    </span>
                  </span>
                  {/* Selector para mover competidor */}
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      moverCompetidor(c.id, grupo.grupo, e.target.value)
                    }
                  >
                    <option value="">Mover a...</option>
                    {brackets
                      .filter((g) => g.grupo !== grupo.grupo)
                      .map((g) => (
                        <option key={g.grupo} value={g.grupo}>
                          {g.grupo}
                        </option>
                      ))}
                  </select>

                  <button
                    className="boton boton-peligro"
                    onClick={() => onDelete(c.id)}
                  >
                    Borrar
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
