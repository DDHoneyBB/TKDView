import React, { useEffect, useState } from "react";
import QrScanner from "qr-scanner";
import "./TestQR.css";

export default function TestQR({ onResult }) {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    console.log("🎬 Iniciando TestQR...");

    const video = document.createElement("video");
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    document.getElementById("scanner-container").appendChild(video);

    QrScanner.hasCamera().then((hasCam) => {
      if (!hasCam) {
        console.error("❌ No hay cámara disponible");
        return;
      }

      const qrScanner = new QrScanner(
        video,
        (result) => {
          console.log("🔍 QR detectado:", result.data);
          
          const dni = result.data.replace(/\D/g, "");
          console.log("🔢 DNI extraído:", dni);

          if (!dni) {
            console.error("❌ DNI vacío");
            return;
          }

          // 🔥 PASAR DATOS AL PADRE
          if (onResult) {
            console.log("🔄 Enviando DNI al padre:", dni);
            onResult({ dni: dni });
          } else {
            console.error("❌ onResult no está definido");
          }

          // Pausar y reanudar scanner
          qrScanner.stop();
          setTimeout(() => {
            qrScanner.start();
            console.log("🔄 Scanner reiniciado");
          }, 1000);

        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 1
        }
      );

      qrScanner.start().then(() => {
        console.log("✅ Scanner iniciado");
        setScanner(qrScanner);
      }).catch(err => {
        console.error("❌ Error iniciando scanner:", err);
      });

      // Cleanup
      return () => {
        console.log("🧹 Limpiando TestQR...");
        qrScanner.stop();
        qrScanner.destroy();
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      };
    });
  }, [onResult]);

  return <div id="scanner-container" style={{ width: "100%", height: "100%" }} />;
}