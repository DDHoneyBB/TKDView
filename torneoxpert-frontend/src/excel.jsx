import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/excel.css";

export default function ExcelExport() {
  const [filtros, setFiltros] = useState({
    graduacion: "",
    escuela: "",
    modalidad: "",
    rol: "",
    genero: "",
    nombreArchivo: "Base_Tatami.xlsx",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const volveralmenu = () => {
    navigate("/");
  };

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleExportar = async () => {
    if (!filtros.nombreArchivo || filtros.nombreArchivo.trim() === "") {
      alert("Por favor, escribí un nombre para el archivo Excel.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/exportar-db", filtros, {
        responseType: "blob",
      });

      // Crear descarga del Excel
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Asegurar extensión .xlsx
      let filename = filtros.nombreArchivo.trim();
      if (!filename.toLowerCase().endsWith(".xlsx")) filename += ".xlsx";

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error al exportar base de datos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      graduacion: "",
      escuela: "",
      modalidad: "",
      rol: "",
      genero: "",
      nombreArchivo: "Base_Tatami.xlsx",
    });
  };

  return (
    <div className="panel-central">
      <h2 className="titulo-seccion">📊 Exportar Base de Datos Tatami</h2>

      <p className="texto-descriptivo">
        Filtrá los datos antes de descargar el Excel.  
        Dejá todo en blanco para exportar la base completa.
      </p>

      <div className="filtros-container">
        <div className="campo-filtro">
          <label>Nombre del archivo</label>
          <input
            type="text"
            name="nombreArchivo"
            value={filtros.nombreArchivo}
            onChange={handleChange}
            placeholder="Ej: Competidores_Mendoza.xlsx"
          />
        </div>

        <div className="campo-filtro">
          <label>Graduación (cinturón)</label>
          <select
            name="graduacion"
            value={filtros.graduacion}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            <option value="blanco">Blanco</option>
            <option value="amarillo">Amarillo</option>
            <option value="verde">Verde</option>
            <option value="azul">Azul</option>
            <option value="rojo">Rojo</option>
            <option value="punta negra">Punta Negra</option>
            <option value="dan">Dan</option>
          </select>
        </div>

        <div className="campo-filtro">
          <label>Escuela</label>
          <input
            name="escuela"
            type="text"
            value={filtros.escuela}
            onChange={handleChange}
            placeholder="Ej: Escuela Central"
          />
        </div>

        <div className="campo-filtro">
          <label>Modalidad</label>
          <div className="checkbox-group">
            <label>
              <input
                type="radio"
                name="modalidad"
                value=""
                checked={filtros.modalidad === ""}
                onChange={handleChange}
              />
              Todas
            </label>
            <label>
              <input
                type="radio"
                name="modalidad"
                value="combate"
                checked={filtros.modalidad === "combate"}
                onChange={handleChange}
              />
              Combate
            </label>
            <label>
              <input
                type="radio"
                name="modalidad"
                value="forma"
                checked={filtros.modalidad === "forma"}
                onChange={handleChange}
              />
              Forma
            </label>
          </div>
        </div>

        <div className="campo-filtro">
          <label>Rol</label>
          <select name="rol" value={filtros.rol} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="competidor">Competidor</option>
            <option value="coach">Coach</option>
            <option value="instructor">Instructor</option>
            <option value="invitado">Invitado</option>
          </select>
        </div>

        <div className="campo-filtro">
          <label>Género</label>
          <select name="genero" value={filtros.genero} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="botones-container">
        <button
          onClick={handleExportar}
          disabled={loading}
          className="btn-exhibicion"
        >
          {loading ? "Generando Excel..." : "Descargar Excel"}
        </button>

        <button onClick={limpiarFiltros} className="btn-deshacer">
          Limpiar filtros
        </button>
        <button onClick={volveralmenu} className="btn-volver">
          Volver al menú
        </button>
      </div>
    </div>
  );
}
