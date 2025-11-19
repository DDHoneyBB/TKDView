// listadoPuntuaciones.jsx
import React, { useState, useEffect } from "react"; // ✅ Import necesario

export default function ListadoPuntuaciones({ tatamiId, jugadorId }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        console.log(tatamiId, jugadorId);
        setCargando(true);
        const res = await fetch(`/api/registros/${tatamiId}`);
        const data = await res.json();
        // Filtrar según jugadorId
        const jugadorNombre = jugadorId == 0 ? "Chong" : "Hong";
        setRegistros(
          data.filter(
            r => r.competidor?.toLowerCase() === jugadorNombre.toLowerCase()
          )
        );
      } catch (err) {
        console.error("Error cargando registros:", err);
      } finally {
        setCargando(false);
      }
    };

    if (tatamiId != null) fetchRegistros();
  }, [tatamiId, jugadorId]);

  if (cargando) return <p>Cargando registros...</p>;
  if (!registros.length) return <p>No hay registros para este jugador.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Juez</th>
          <th>Competidor</th>
          <th>Puntos</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((r) => {
          // Convertir fecha (en segundos) a mm:ss si supera 60
          let fechaDisplay = r.fecha;
          if (!isNaN(r.fecha) && r.fecha >= 60) {
            const minutos = Math.floor(r.fecha / 60);
            const segundos = r.fecha % 60;
            fechaDisplay = `${minutos}:${segundos.toString().padStart(2, "0")}`;
          }

          return (
            <tr key={r.id}>
              <td>{fechaDisplay}</td>
              <td>{r.juez}</td>
              <td>{r.competidor}</td>
              <td>{r.valor}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
