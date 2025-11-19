import React, { useState, useEffect, useCallback } from "react";
import QRCodeViewer from "./components/QRCodeViewer";
import "./styles/subirEscuela.css";
import { useNavigate } from "react-router-dom";

export default function SubirEscuela() {
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [instructores, setInstructores] = useState([""]);
  const [dnis, setDnis] = useState([""]);
  const [mensaje, setMensaje] = useState("");
  const [credenciales, setCredenciales] = useState([]);
  const [escuelas, setEscuelas] = useState([]);       // 🆕 Lista de escuelas existentes
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState("nueva"); // 🆕 Selección
  const [validacionesDni, setValidacionesDni] = useState({});
  const [verificandoDnis, setVerificandoDnis] = useState({});
  const navigate = useNavigate();

  // 🔹 Cargar lista de escuelas existentes
  useEffect(() => {
    const cargarEscuelas = async () => {
      try {
        const res = await fetch("/api/escuelas");
        const data = await res.json();
        setEscuelas(data || []);
      } catch (error) {
        console.error("Error al obtener escuelas:", error);
      }
    };
    cargarEscuelas();
  }, []);

  // 🔹 Verificación DNI (igual que antes)
  const verificarDniEnServidor = useCallback(async (dni, index) => {
    if (!dni || dni.trim().length < 3) {
      setValidacionesDni((prev) => ({ ...prev, [index]: { valido: true } }));
      return;
    }

    setVerificandoDnis((prev) => ({ ...prev, [index]: true }));

    try {
      const response = await fetch("/api/verificar-dni-unico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim() }),
      });
      const data = await response.json();
      setValidacionesDni((prev) => ({
        ...prev,
        [index]: { valido: data.valido, mensaje: data.mensaje },
      }));
    } catch (error) {
      console.error("Error verificando DNI:", error);
      setValidacionesDni((prev) => ({
        ...prev,
        [index]: { valido: false, mensaje: "Error al verificar DNI" },
      }));
    } finally {
      setVerificandoDnis((prev) => ({ ...prev, [index]: false }));
    }
  }, []);

  useEffect(() => {
    dnis.forEach((dni, index) => {
      if (dni && dni.trim().length >= 3) {
        const timeout = setTimeout(() => verificarDniEnServidor(dni, index), 500);
        return () => clearTimeout(timeout);
      }
    });
  }, [dnis, verificarDniEnServidor]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAddField = () => {
    setInstructores([...instructores, ""]);
    setDnis([...dnis, ""]);
  };

  const handleChangeArray = (setter, index, value) => {
    setter((prev) => {
      const copia = [...prev];
      copia[index] = value;
      return copia;
    });
  };

  // 🔹 Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const instructoresValidos = instructores
      .map((inst, i) => ({
        nombre: inst.trim(),
        dni: dnis[i]?.trim(),
      }))
      .filter((i) => i.nombre && i.dni);

    if (instructoresValidos.length === 0) {
      setMensaje("⚠️ Ingrese al menos un instructor.");
      return;
    }

    try {
      let res;
      if (escuelaSeleccionada === "nueva") {
        // 🔸 Crear nueva escuela
        const formData = new FormData();
        formData.append("nombre", nombre);
        if (logo) formData.append("logo", logo);
        formData.append("instructores", JSON.stringify(instructoresValidos));

        res = await fetch("/api/escuelas", { method: "POST", body: formData });
      } else {
        // 🔸 Agregar instructores a escuela existente
        res = await fetch(`/api/escuelas/${escuelaSeleccionada}/instructores`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instructores: instructoresValidos }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");

      setMensaje(
        escuelaSeleccionada === "nueva"
          ? `✅ Escuela "${nombre}" creada correctamente.`
          : `✅ Instructores agregados a la escuela seleccionada.`
      );

      setCredenciales(
        instructoresValidos.map((inst) => ({
          nombre: inst.nombre,
          dni: inst.dni,
          escuela: escuelaSeleccionada === "nueva" ? nombre : escuelas.find(e => e.id === parseInt(escuelaSeleccionada))?.nombre,
          logoEscuela:
            escuelaSeleccionada === "nueva"
              ? preview
              : escuelas.find((e) => e.id === parseInt(escuelaSeleccionada))?.logo,
        }))
      );

      // Limpiar
      setNombre("");
      setLogo(null);
      setPreview(null);
      setInstructores([""]);
      setDnis([""]);
    } catch (error) {
      setMensaje(`❌ ${error.message}`);
    }
  };

  return (
    <div className="subir-escuela">
      <h2>Registrar Escuela o Instructores</h2>
      <h3> selecione su escuela y registrese, de no encontrarse en la lista registrela y luego registre el instructor</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Seleccionar escuela existente:</label>
          <select
            value={escuelaSeleccionada}
            onChange={(e) => {
              setEscuelaSeleccionada(e.target.value);
              if (e.target.value !== "nueva") {
                const esc = escuelas.find((es) => es.id === parseInt(e.target.value));
                setNombre(esc?.nombre || "");
                setPreview(esc?.logo || null);
              } else {
                setNombre("");
                setPreview(null);
              }
            }}
          >
            <option value="nueva">➕ Nueva escuela</option>
            {escuelas.map((esc) => (
              <option key={esc.id} value={esc.id}>
                {esc.nombre}
              </option>
            ))}
          </select>
        </div>

        {escuelaSeleccionada === "nueva" && (
          <>
            <div className="form-group">
              <label>Nombre de la escuela:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Logo de la escuela:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required />
            </div>

            {preview && (
              <div className="preview">
                <img src={preview} alt="Preview Logo" style={{ maxWidth: "250px" }} />
              </div>
            )}
          </>
        )}

        {escuelaSeleccionada !== "nueva" && preview && (
          <div className="preview">
            <h4>Logo actual:</h4>
            <img src={preview} alt="Logo escuela" style={{ maxWidth: "200px" }} />
          </div>
        )}

        <div className="form-group">
          <label>Instructores y DNI:</label>
          {instructores.map((inst, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                placeholder="Apellido y Nombre"
                value={inst}
                onChange={(e) => handleChangeArray(setInstructores, index, e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="DNI"
                value={dnis[index] || ""}
                onChange={(e) => handleChangeArray(setDnis, index, e.target.value)}
                required
              />
              {index > 0 && (
                <button type="button" onClick={() => {
                  setInstructores(instructores.filter((_, i) => i !== index));
                  setDnis(dnis.filter((_, i) => i !== index));
                }}>
                  ❌
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddField}>+ Agregar Instructor</button>
        </div>

        <button type="submit">
          {escuelaSeleccionada === "nueva" ? "Registrar Escuela" : "Agregar Instructores"}
        </button>
      </form>

      {mensaje && <div className="mensaje">{mensaje}</div>}

      {credenciales.length > 0 && (
        <div>
          <h3>Credenciales generadas:</h3>
          {credenciales.map((cred, i) => (
            <QRCodeViewer key={i} {...cred} rol="instructor" allowDownload ocultarFoto />
          ))}
        </div>
      )}
    </div>
  );
}
