import React, { useState, useEffect } from "react";
import QRScanner from "./TestQr";

export default function ValidarIngreso() {
  const [vista, setVista] = useState("menu");
  const [ingresados, setIngresados] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [usuarioData, setUsuarioData] = useState(null);
  const [scannerActivo, setScannerActivo] = useState(true);
  const [dniEscaneado, setDniEscaneado] = useState("");
  const [inputManual, setInputManual] = useState("");

  // --- Lógica QR ---
  const handleQRResult = (datos) => {
    if (!scannerActivo) return;
    const dni = datos?.dni || datos; // soporta QR o texto directo
    if (!dni) {
      setMensaje({ text: "QR inválido: no contiene DNI", tipo: "error" });
      return;
    }
    setDniEscaneado(dni);
    setScannerActivo(false);
    setMensaje({ text: `🔍 DNI ${dni} escaneado. ¿Validar ingreso?`, tipo: "confirmacion" });
  };

  // --- Validar ingreso en backend ---
  const validarIngreso = () => {
    if (!dniEscaneado) return;
    
    // VERIFICACIÓN CORREGIDA: Buscar por propiedad dni en los objetos
    if (ingresados.some(usuario => usuario.dni === dniEscaneado)) {
      setMensaje({ text: `⚠️ DNI ${dniEscaneado} ya ingresó`, tipo: "error" });
      setDniEscaneado("");
      return;
    }

    // El resto del código se mantiene igual...
    fetch(`/api/validaringreso/usuarios/validar?dni=${dniEscaneado}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then((info) => {
        if (info.autorizado) {
          const nuevo = {
            dni: dniEscaneado,
            nombre: info.nombre,
            rol: info.rol,
            hora: new Date().toLocaleTimeString(),
          };
          setUsuarioData(nuevo);
          
          // En lugar de agregar localmente, recargar desde BD
          cargarIngresados();
          
          setMensaje({ text: `✅ Ingreso autorizado para ${info.nombre}`, tipo: "ok" });
          setTimeout(() => {
            setMensaje(null);
            setUsuarioData(null);
          }, 2500);
        } else {
          setMensaje({ text: info.mensaje || "❌ Usuario no autorizado", tipo: "error" });
        }
        setDniEscaneado("");
      })
      .catch(() => {
        setMensaje({ text: "❌ Error de conexión", tipo: "error" });
        setDniEscaneado("");
      });
  };

  useEffect(() => {
    console.log("Vista actual:", vista);
    if (vista === "dni" || vista === "qr") {
      cargarIngresados();
    }
  }, [vista]);

  // --- Cargar DNIs ya ingresados desde la base de datos ---
  const cargarIngresados = async () => {
    try {
      const response = await fetch('/api/validaringreso/usuarios/ingresados');
      const data = await response.json();
      console.log("📥 Datos recibidos:", data);

      if (Array.isArray(data.ingresos)) {
        setIngresados(data.ingresos);
      } else {
        setIngresados([]);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setIngresados([]);
    }
  };

  const iniciarNuevoEscaneo = () => {
    setScannerActivo(true);
    setMensaje(null);
    setUsuarioData(null);
  };

  const clearIngresados = () => {
    setIngresados([]);
    setUsuarioData(null);
  };

  const validarManual = () => {
    if (!inputManual.trim()) {
      alert("Ingresá un DNI para validar");
      return;
    }
    handleQRResult({ dni: inputManual.trim() });
    setInputManual("");
  };

  // --- Renderizado por vistas ---
  const renderVista = () => {
    switch (vista) {
      case "qr":
        return (
          <div
            style={{
              width: "100vw",
              height: "100vh",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "rgba(255,255,255,0.95)",
                padding: "15px 20px",
                textAlign: "center",
                boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h1 style={{ margin: 0, color: "#2c3e50", fontSize: "28px", fontWeight: "bold" }}>
                🎯 CONTROL DE INGRESOS
              </h1>
              <p style={{ margin: "5px 0 0 0", color: "#7f8c8d", fontSize: "14px" }}>
                Torneo Xpert - Escanear QR o validar manualmente
              </p>
            </div>

            {/* Botón Volver */}
            <button
              onClick={() => setVista("menu")}
              style={{
                position: "absolute",
                top: "15px",
                left: "15px",
                background: "rgba(255,255,255,0.3)",
                color: "black",
                border: "none",
                padding: "10px 15px",
                borderRadius: "10px",
                cursor: "pointer",
                zIndex: 100,
                fontWeight: "bold",
              }}
            >
              ⬅ Volver
            </button>

            {/* Scanner */}
            <div
              style={{
                width: "100%",
                height: "calc(100% - 140px)",
                opacity: scannerActivo ? 1 : 0.5,
                transition: "opacity 0.3s ease",
              }}
            >
              <QRScanner onResult={handleQRResult} />
            </div>

            {/* Entrada manual */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <input
                type="text"
                value={inputManual}
                onChange={(e) => setInputManual(e.target.value)}
                placeholder="Ingresar DNI manualmente"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  width: "180px",
                }}
              />
              <button onClick={validarManual} style={botonModal}>
                ✅ Validar
              </button>
            </div>

            {/* Panel inferior */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                background: "rgba(255,255,255,0.95)",
                padding: "15px 20px",
                borderRadius: "15px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                minWidth: "220px",
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#2c3e50" }}>
                📊 Estadísticas
              </div>
              <div style={{ fontSize: "14px", color: "#7f8c8d" }}>
                ✅ Ingresos: <strong>{ingresados.length}</strong>
                {usuarioData && <div>Último: {usuarioData.nombre}</div>}
              </div>
              {ingresados.length > 0 && (
                <button
                  onClick={clearIngresados}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginTop: "10px",
                  }}
                >
                  🧹 Limpiar
                </button>
              )}
            </div>

            {/* Modales */}
            {mensaje?.tipo === "confirmacion" && (
              <div style={modalEstilo("#f39c12", "#e67e22")}>
                <h3>CONFIRMAR VALIDACIÓN</h3>
                <p>{mensaje.text}</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button onClick={validarIngreso} style={botonModal}>
                    ✅ Validar
                  </button>
                  <button onClick={iniciarNuevoEscaneo} style={botonModal}>
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            )}

            {mensaje?.tipo === "ok" && (
              <div style={modalEstilo("#00b09b", "#96c93d")}>
                <h2>{mensaje.text}</h2>
                <button onClick={iniciarNuevoEscaneo} style={botonModal}>
                  🔄 Nuevo QR
                </button>
              </div>
            )}

            {mensaje?.tipo === "error" && (
              <div style={modalEstilo("#ff416c", "#ff4b2b")}>
                <h3>{mensaje.text}</h3>
                <button onClick={iniciarNuevoEscaneo} style={botonModal}>
                  🔄 Reintentar
                </button>
              </div>
            )}
          </div>
        );

      case "dni":
        return (
          <div className="vista-secundaria" style={{ textAlign: "center", padding: "40px" }}>
            <h3>🧾 Personas que ya ingresaron</h3>
            <button onClick={cargarIngresados} style={{ marginBottom: "20px" }}>
              🔄 Actualizar lista
            </button>
            
            {ingresados.length === 0 ? (
              <p>No hay ingresos registrados aún.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
                {ingresados.map((usuario, index) => (
                  <div key={index} style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    borderRadius: "10px",
                    minWidth: "200px",
                    background: "#f9f9f9"
                  }}>
                    <div><strong>DNI:</strong> {usuario.dni}</div>
                    <div><strong>Nombre:</strong> {usuario.nombre}</div>
                    <div><strong>Rol:</strong> {usuario.rol}</div>
                    <div><strong>Hora:</strong> {usuario.horaIngreso}</div>
                  </div>
                ))}
              </div>
            )}
            <button className="volver-btn" onClick={() => setVista("menu")} style={{ marginTop: "20px" }}>
              ⬅ Volver
            </button>
          </div>
        );

      default:
        return (
          <div className="menu-validacion" style={{ textAlign: "center", padding: "60px" }}>
            <h2>Selecciona una opción</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button onClick={() => setVista("qr")} className="btn-opcion">
                📷 Escanear QR
              </button>
              <button onClick={() => setVista("dni")} className="btn-opcion">
                🧾 Ver DNI ingresados
              </button>
            </div>
          </div>
        );
    }
  };

  const modalEstilo = (color1, color2) => ({
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center",
    color: "white",
    zIndex: 10,
    minWidth: "350px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  });

  const botonModal = {
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  };

  return <>{renderVista()}</>;
}
