import React, { useState } from "react";
import { QrReader } from "react-qr-reader-es6";

export default function LectorQR() {
  const [resultado, setResultado] = useState(null);
  const [leyendo, setLeyendo] = useState(false);

  const handleScan = async (data) => {
    if (data && !leyendo) {
      setLeyendo(true);
      try {
        const info = JSON.parse(data); // El QR contiene un JSON con nombre, dni, etc.
        console.log("📥 QR detectado:", info);

        const res = await fetch("http://66.97.45.122:8000/api/validar-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(info),
        });

        const json = await res.json();
        console.log("✅ Respuesta del servidor:", json);
        setResultado(json);
      } catch (err) {
        console.error("❌ Error procesando QR:", err);
        setResultado({ mensaje: "QR inválido o dañado", color: "red" });
      } finally {
        // evita múltiples lecturas seguidas
        setTimeout(() => setLeyendo(false), 1500);
      }
    }
  };

  const handleError = (err) => {
    console.error("⚠️ Error de cámara:", err);
    setResultado({
      mensaje: "No se pudo acceder a la cámara. Permití el acceso.",
      color: "red",
    });
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "1rem",
        background: "#111",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h2>📷 Control de Ingreso</h2>
      <p>Apuntá el QR con la cámara del celular</p>

      <div style={{ margin: "1rem auto", width: "100%", maxWidth: 400 }}>
        <QrReader
          onResult={(result, error) => {
            if (!!result) handleScan(result?.text);
            if (!!error) handleError(error);
          }}
          constraints={{ facingMode: "environment" }} // Cámara trasera
          containerStyle={{
            width: "100%",
            borderRadius: "10px",
            overflow: "hidden",
          }}
          videoStyle={{
            width: "100%",
            height: "auto",
          }}
        />
      </div>

      {resultado && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            borderRadius: "10px",
            backgroundColor:
              resultado.color === "green"
                ? "#28a745"
                : resultado.color === "orange"
                ? "#ffc107"
                : "#dc3545",
            color: "#fff",
          }}
        >
          <h3>{resultado.nombre || "QR Detectado"}</h3>
          {resultado.escuela && <p>🏫 {resultado.escuela}</p>}
          {resultado.categoria && (
            <p>
              ⚔️ {resultado.categoria} - {resultado.modalidad}
            </p>
          )}
          {resultado.rol && (
            <p>
              <strong>Rol:</strong> {resultado.rol}
            </p>
          )}
          <p>{resultado.mensaje}</p>
        </div>
      )}
    </div>
  );
}
