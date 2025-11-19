import React, { useEffect, useState } from "react";

const ListadoPuntuaciones = ({ id }) => {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    // Función para obtener los registros
    const fetchRegistros = () => {
      fetch("/api/registros-recibir")
        .then(res => res.json())
        .then(data => setRegistros(data))
        .catch(() => setRegistros([]));
    };

    fetchRegistros(); // Llamada inicial

    // Polling cada 2 segundos
    const interval = setInterval(fetchRegistros, 2000);

    // Limpieza al desmontar
    return () => clearInterval(interval);
  }, []);

  const eliminarRegistro = (id) => {
    fetch(`/api/registros-recibir/${id}`, {
      method: "DELETE",
    })
      .then(res => res.json())
      .then(() => {
        setRegistros(registros.filter(reg => reg.id !== id));
      });
  };

  // Filtrar registros según el id recibido
  const registrosFiltrados = registros.filter(
    reg => String(reg.competidor) === String(id)
  );

  return (
    <div>
      <h2>Listado de Registros</h2>
      <table>
        <thead>
            <tr>
            <th>Juez</th>
            <th>Valor</th>
            <th>Fecha</th>
            <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {registrosFiltrados.map(reg => (
            <tr key={reg.id}>
                <td>{reg.juez}</td>
                <td>+{reg.valor}</td>
                <td>{reg.fecha}</td>
                <td>
                <button onClick={() => eliminarRegistro(reg.id)}>
                    Eliminar
                </button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
};

export default ListadoPuntuaciones;