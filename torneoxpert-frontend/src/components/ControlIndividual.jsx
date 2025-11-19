import React, { useState } from "react";
import "./Tatamisala.css";

function ControlIndividual({ prefix, onEnviarSenal }) {
  const [modoReducido, setModoReducido] = useState(false);

  const handleBotonClick = (puntos, tipo, color) => {
    onEnviarSenal(puntos, tipo, color, prefix);
  };

  return (
    <div className="mobile-simulator">
      <div className="mobile-simulator2">
        <div className="grid-botones">
          {/* Columna Azul (cluster izquierdo) */}
          <div className="columna cluster-left pos-relative" style={{ minHeight: 160 }}>
            {modoReducido ? (
              <>
                <button
                  className="btn azul solo-switch"
                  onClick={() => handleBotonClick("Tecnica", "especial", "azul")}
                >
                  Técnica
                </button>
                <button
                  className="btn azul solo-switch2"
                  onClick={() => handleBotonClick("Poder", "especial", "azul")}
                >
                  Poder
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn azul extra pos-abs p1"
                  onClick={() => handleBotonClick(1, "normal", "azul")}
                >
                  <span>1</span>
                </button>
                <button
                  className="btn azul extra pos-abs p2"
                  onClick={() => handleBotonClick(2, "normal", "azul")}
                >
                  <span>2</span>
                </button>
                <button
                  className="btn azul extra pos-abs p3"
                  onClick={() => handleBotonClick(3, "normal", "azul")}
                >
                  <span>3</span>
                </button>
                <button
                  className="btn azul extra pos-abs p4"
                  onClick={() => handleBotonClick(4, "normal", "azul")}
                >
                  <span>4</span>
                </button>
                <button
                  className="btn azul extra pos-abs p5"
                  onClick={() => handleBotonClick(5, "normal", "azul")}
                >
                  <span>5</span>
                </button>
              </>
            )}
          </div>

          {/* Panel Central */}
          <div className="panel-central">
            <button className="btn control start">Start</button>
            <button className="btn control reset">Reset</button>
            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={modoReducido}
                  onChange={(e) => setModoReducido(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Columna Roja (cluster derecho) */}
          <div className="columna cluster-right pos-relative" style={{ minHeight: 160 }}>
            {modoReducido ? (
              <>
                <button
                  className="btn rojo solo-switch"
                  onClick={() => handleBotonClick("Tecnica", "especial", "rojo")}
                >
                  Técnica
                </button>
                <button
                  className="btn rojo solo-switch2"
                  onClick={() => handleBotonClick("Poder", "especial", "rojo")}
                >
                  Poder
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn rojo extra pos-abs p5"
                  onClick={() => handleBotonClick(5, "normal", "rojo")}
                >
                  <span>5</span>
                </button>
                <button
                  className="btn rojo extra pos-abs p4"
                  onClick={() => handleBotonClick(4, "normal", "rojo")}
                >
                  <span>4</span>
                </button>
                <button
                  className="btn rojo extra pos-abs p3"
                  onClick={() => handleBotonClick(3, "normal", "rojo")}
                >
                  <span>3</span>
                </button>
                <button
                  className="btn rojo extra pos-abs p2"
                  onClick={() => handleBotonClick(2, "normal", "rojo")}
                >
                  <span>2</span>
                </button>
                <button
                  className="btn rojo extra pos-abs p1"
                  onClick={() => handleBotonClick(1, "normal", "rojo")}
                >
                  <span>1</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="estado" style={{ display: "none" }}>
        Estado: Inactivo
      </div>
    </div>
  );
}

export default ControlIndividual;