import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Llaves from "./Llaves";
import "./LLavesView.css";

function LlavesGeneralView() {
  const [bracketsCombate, setBracketsCombate] = useState([]);
  const [bracketsForma, setBracketsForma] = useState([]);
  const [todosCompetidores, setTodosCompetidores] = useState([]);
  const [competidoresFiltrados, setCompetidoresFiltrados] = useState([]);
  const [exhibiciones, setExhibiciones] = useState([]);
  const [rivalManual, setRivalManual] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState("");
  const [filtroEdad, setFiltroEdad] = useState("");
  const [filtroGraduacion, setFiltroGraduacion] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [mostrarFormas, setMostrarFormas] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [dnisState, setDnisState] = useState([]); // Array con DNIs de competidores activos

  const navigate = useNavigate();
  const volverAlMenu = () => navigate("/");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  
  // Fetch inicial
  useEffect(() => {
    fetch("https://torneoxpert.digital/api/brackets")
      .then(res => res.json())
      .then(data => {
        setBracketsCombate(data.brackets || []);
        setExhibiciones(data.exhibiciones || []);
      });

    fetch("/api/brackets-forma")
      .then(res => res.json())
      .then(data => setBracketsForma(data.brackets || []));

    fetch("/api/competidores")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTodosCompetidores(data);
        else if (Array.isArray(data.competidores)) setTodosCompetidores(data.competidores);
        else setTodosCompetidores([]);
      });
  }, []);


  // Filtro de competidores
  useEffect(() => {
    const filtrados = todosCompetidores.filter((c) => {
      const coincideNombre = c.nombre?.toLowerCase().includes(busqueda.toLowerCase());
      const coincideGenero = filtroGenero ? c.genero?.toLowerCase() === filtroGenero.toLowerCase() : true;
      const coincideEdad = filtroEdad ? c.edad === Number(filtroEdad) : true;
      const coincideGraduacion = filtroGraduacion ? c.graduacion?.toLowerCase() === filtroGraduacion.toLowerCase() : true;
      const coincideCategoria = filtroCategoria ? c.categoria?.toLowerCase() === filtroCategoria.toLowerCase() : true;
      return coincideNombre && coincideGenero && coincideEdad && coincideGraduacion && coincideCategoria;
    });
    setCompetidoresFiltrados(filtrados);
  }, [todosCompetidores, busqueda, filtroGenero, filtroEdad, filtroGraduacion, filtroCategoria]);

  const aceptarExhibicion = (exhibicion) => {
    const rival_id = rivalManual[exhibicion.grupo] || (exhibicion.rivalSugerido && exhibicion.rivalSugerido.id);
    if (!rival_id) {
      alert("Selecciona un rival para la exhibición");
      return;
    }
    
      fetch("https://torneoxpert.digital/api/exhibiciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        competidor_id: exhibicion.competidor.id,
        rival_id,
        grupo: exhibicion.grupo
      })
    }).then(() => {
      alert("Exhibición aceptada y guardada");
      // Refrescar brackets
      fetch("https://torneoxpert.digital/api/brackets")
        .then(res => res.json())
        .then(data => {
          setBracketsCombate(data.brackets || []);
          setExhibiciones(data.exhibiciones || []);
        });
    });
  };

  return (
    <div className="app-contenedor">
      <div className="panel-central">
        <h1>Llaves de Competencia</h1>

        {/* Switch Combate / Formas */}
        <div className="switch-container">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={mostrarFormas}
              onChange={() => setMostrarFormas(!mostrarFormas)}
            />
            <span className="slider round"></span>
          </label>
          <span>{mostrarFormas ? "Mostrando Formas" : "Mostrando Combate"}</span>
        </div>

        
        {/* Filtros y buscador */}
        {!mostrarFormas && (
          <div className="buscador-container">
            <h2>Buscar competidor</h2>
            <label>Nombre:
              <input type="text" placeholder="Nombre" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </label>
            <label>Graduación:
              <select value={filtroGraduacion} onChange={e => setFiltroGraduacion(e.target.value)}>
                <option value="">Todas las graduaciones</option>
                <option value="Blanco">Blanco</option>
                <option value="Blanco punta Amarilla">Blanco punta Amarilla</option>
                <option value="Amarillo">Amarillo</option>
                <option value="Amarillo punta verde">Amarillo punta verde</option>
                <option value="Verde">Verde</option>
                <option value="Verde punta azul">Verde punta azul</option>
                <option value="Azul">Azul</option>
                <option value="Azul punta roja">Azul punta roja</option>
                <option value="Rojo">Rojo</option>
                <option value="Rojo punta negra">Rojo punta negra</option>
                <option value="Negro I Dan">Negro I Dan</option>
                <option value="Negro II Dan">Negro II Dan</option>
                <option value="Negro III Dan">Negro III Dan</option>
                <option value="Negro VI Dan">Negro VI Dan</option>
              </select>
            </label>
            <label>Categoría:
              <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                <option value="">Todas las categorías</option>
                <option value="Infantil">Infantil</option>
                <option value="Juvenil">Juvenil</option>
                <option value="Adultos">Adultos</option>
                <option value="Veteranos">Veteranos</option>
              </select>
            </label>
            <label>Género:
              <select value={filtroGenero} onChange={e => setFiltroGenero(e.target.value)}>
                <option value="">Todos los géneros</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </label>
            <label>Edad:
              <input type="number" placeholder="Edad" value={filtroEdad} onChange={e => setFiltroEdad(e.target.value)} min="0"/>
            </label>

            <div className="resultados-busqueda">
              {competidoresFiltrados.length === 0 ? (
                <p>No se encontraron competidores.</p>
              ) : (
                <>
                  <div className={`scrollable-list ${mostrarTodos ? "expandida" : ""}`}>
                    <ul>
                      {(mostrarTodos ? competidoresFiltrados : competidoresFiltrados.slice(0, 5)).map(c => (
                        <li key={c.id}>{c.nombre} ({c.genero}, {c.categoria}, {c.graduacion}, {c.edad} años)</li>
                      ))}
                    </ul>
                  </div>
                  {competidoresFiltrados.length > 5 && (
                    <button className="btn-ver-todos" onClick={() => setMostrarTodos(!mostrarTodos)}>
                      {mostrarTodos ? "Ver menos" : "Ver todos"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Llaves */}
        {!mostrarFormas ? (
          <>
            <h2>Llaves de Combate</h2>
            {bracketsCombate.length === 0 ? <p>No hay llaves de combate para mostrar.</p> :
              <Llaves  
                competidoresCompletos={todosCompetidores}
                brackets={bracketsCombate} modo="combate"
              />
            }
          </>
        ) : (
          <>
            <h2>Llaves de Formas</h2>
            {bracketsForma.length === 0 ? <p>No hay llaves de formas para mostrar.</p> :
              <Llaves brackets={bracketsForma} modo="forma" />
            }
          </>
        )}

        {/* Exhibiciones */}
        {exhibiciones.length > 0 && (
          <div className="exhibiciones-container">
            <h2 className="titulo-seccion">Exhibiciones sugeridas</h2>
            <div className="exhibicion-carrusel">
              {exhibiciones.map((ex, i) => {
                const posiblesRivales = todosCompetidores.filter(
                  c => c.genero === ex.competidor.genero && c.id !== ex.competidor.id
                );
                return (
                  <div key={i} className="llaves-exhibicion">
                    <strong>Competidor:</strong> {ex.competidor.nombre} ({ex.competidor.genero}, {ex.competidor.edad} años)
                    <br />
                    <strong>Rival sugerido:</strong>{" "}
                    {ex.rivalSugerido
                      ? `${ex.rivalSugerido.nombre} (${ex.rivalSugerido.genero}, ${ex.rivalSugerido.edad} años)`
                      : <span className="texto-error">No hay rival sugerido</span>}
                    <br />
                    <label>
                      Elegir rival manualmente:&nbsp;
                      <select
                        className="seleccionar-rival"
                        value={rivalManual[ex.grupo] || ""}
                        onChange={e => setRivalManual({ ...rivalManual, [ex.grupo]: Number(e.target.value) })}
                      >
                        <option value="">-- Selecciona --</option>
                        {posiblesRivales.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.nombre} ({r.edad} años)
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="btn-exhibicion"
                      onClick={() => aceptarExhibicion(ex)}
                      disabled={posiblesRivales.length === 0}
                    >
                      Aceptar exhibición
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botón volver */}
        <div className="botones-container">
          <button className="btn-volver" onClick={volverAlMenu}>Volver al menú</button>
        </div>

      </div>
    </div>
  );
}

export default LlavesGeneralView;