import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import '../styles/QRCodeViewer.css';

export default function QRCodeViewer({
  nombre,
  dni,
  categoria,
  escuela,
  modalidad,
  rol,
  quiereCompetir,
  logoEscuela,
  foto,
  dorsal,
  allowDownload = false,
  allowPrint = false,
  ocultarFoto = false // 👈 NUEVA PROP
}) {
  const credencialRef = useRef();

  if (!nombre || !dni) return null;

  const mostrarCategoria =
    rol === 'competidor' ||
    ((rol === 'Coach' || rol === 'instructor') && quiereCompetir);

  const qrData = JSON.stringify({
    nombre,
    dni,
    ...(categoria && { categoria }),
    ...(escuela && { escuela }),
    ...(modalidad && { modalidad }),
    ...(dorsal && { dorsal })
  });

  // Descargar credencial como imagen
  const handleDownloadCredencial = async () => {
    if (!credencialRef.current) return;

    const canvas = await html2canvas(credencialRef.current);
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = `credencial_${nombre}_${dni}.png`;
    link.click();
  };


  const handlePrint = async () => {
  if (!credencialRef.current) return;

  try {
    const canvas = await html2canvas(credencialRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL("image/png");

    // Ajuste de tamaño (ligeramente más alto)
    const printW = 8;  // ancho (cm)
    const printH = 17; // alto (cm) --> antes 10, ahora 11
    const paddingCm = 0.3; // agrega aire alrededor

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Imprimir Credencial</title>
          <style>
            @page { size: ${printW}cm ${printH}cm; margin: 0; }
            html, body {
              height: 100%;
              margin: 0;
              padding: ${paddingCm}cm 0;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            img {
              width: ${printW - paddingCm * 2}cm;
              height: ${printH - paddingCm * 2}cm;
              object-fit: contain;
              display: block;
            }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          <img src="${imgData}" onload="setTimeout(()=>{window.print();window.close();},300)" />
        </body>
      </html>
    `);
    ventana.document.close();
  } catch (err) {
    console.error("Error al generar imagen para imprimir:", err);
  }
};

// 🔹 Imprimir dorsal con estilo visual
const handlePrintDorsal = () => {
  if (!dorsal) {
    alert("No hay dorsal asignado todavía");
    return;
  }

  const coloresCategoria = {
    adultos: "#4c8dceff",
    jovenes: "#57bb5cff",
    veteranos: "#e59545ff",
    infantil: "#aa51c2ff",
    default: "#030303ff",
  };

  const color = coloresCategoria[categoria?.toLowerCase()] || coloresCategoria.default;
  const logo = logoEscuela || "https://via.placeholder.com/100x100.png?text=Logo";

  const ventana = window.open('', '_blank');
  ventana.document.write(`
    <html>
      <head>
        <title>Imprimir Dorsal</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          body {
            margin: 0;
            font-family: 'Arial Black', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: white;
          }
          .dorsal {
            width: 90%;
            border: 5px solid black;
            text-align: center;
            position: relative;
          }
          .header {
            background: ${color};
            color: white;
            font-size: 32px;
            font-weight: bold;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
          }
          .header img {
            height: 80px;
            width: auto;
          }
          .number {
            font-size: 250px;
            font-weight: 900;
            margin: 30px 0 10px 0;
          }
          .category {
            font-size: 42px;
            font-weight: bold;
            color: #444;
            margin-bottom: 20px;
          }
          .footer {
            background: ${color};
            color: white;
            font-size: 36px;
            font-weight: bold;
            padding: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="dorsal">
          <div class="header">
            <img src="${logo}" alt="Logo" />
            <span>${escuela || "Escuela de Artes Marciales"}</span>
          </div>
          <div class="number">${dorsal}</div>
          <div class="category">${categoria || ""}</div>
          <div class="footer">${nombre || ""}</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  ventana.document.close();
};

  return (
    <div className="credencial-wrapper">
      <h4>Tu Credencial</h4>

              <div ref={credencialRef} className="credencial">
          {logoEscuela && (
            <div className="credencial-logo">
              <img src={logoEscuela} alt="Logo Escuela" />
            </div>
          )}

          {/* 🔹 Mostrar foto si existe y no está oculta */}
          {!ocultarFoto && (
            <div className="credencial-foto">
              {foto ? (
                <img src={foto} alt="Foto del participante" />
              ) : (
                <div className="foto-placeholder">Sin foto</div>
              )}
            </div>
          )}


        

        <div className="credencial-info">
          <h2>{nombre}</h2>
          <p><strong>DNI:</strong> {dni}</p>
          {escuela && <p><strong>Escuela:</strong> {escuela}</p>}
          {mostrarCategoria && categoria && <p><strong>Categoría:</strong> {categoria}</p>}
          {dorsal && <p><strong>Dorsal:</strong> {dorsal}</p>}
          {modalidad && <p><strong>Modalidad:</strong> {modalidad}</p>}
          {rol && (
            <p><strong>Rol:</strong> {rol} {quiereCompetir && '-Competidor'}</p>
          )}
        </div>

        <div className="credencial-qr">
          <QRCodeCanvas
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            className="qr-canvas"
          />
        </div>
      </div>

      {(allowDownload || allowPrint) && (
        <div className="credencial-buttons">
          {allowDownload && (
            <button className="btn-blue" onClick={handleDownloadCredencial}>
              Descargar Credencial
            </button>
          )}
          {allowPrint && (
            <>
              <button className="btn-green" onClick={handlePrint}>
                Imprimir credencial
              </button>
              <button className="btn-red" onClick={handlePrintDorsal}>
                Imprimir dorsal
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
