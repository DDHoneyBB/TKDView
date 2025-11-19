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


  // Imprimir credencial completa
  // const handlePrint = () => {
  //   const ventana = window.open('', '_blank');

  //   const fotoHTML = foto
  //     ? `<img src="${foto}" alt="Foto del participante" class="foto-print" />`
  //     : ocultarFoto
  //     ? '' // 👈 Si ocultarFoto es true, no mostrar nada
  //     : `<div style="text-align: center"><p>No hay foto disponible</p></div>`;

  //   const logoHTML = logoEscuela
  //     ? `<img src="${logoEscuela}" alt="Logo escuela" class="logo-print" />`
  //     : '';

  //   const categoriaHTML =
  //     mostrarCategoria && categoria
  //       ? `<p><strong>Categoría:</strong> ${categoria}</p>`
  //       : '';

  //   const dorsalHTML = dorsal
  //     ? `<p><strong>Dorsal:</strong> ${dorsal}</p>`
  //     : '';

  //   ventana.document.write(`
  //     <html> 
  //       <head> 
  //         <title>Imprimir Credencial</title> 
  //         <style> 
  //           @media print { body { margin: 0; padding: 0; } }
  //           .credencial-print {
  //             width: 600px;
  //             height: 350px;
  //             border: 2px solid #333;
  //             border-radius: 15px;
  //             display: flex;
  //             overflow: hidden;
  //             background-color: #fff;
  //             box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  //             margin: 20px auto;
  //           }
  //           .foto-container {
  //             width: 40%;
  //             display: flex;
  //             justify-content: center;
  //             align-items: center;
  //             background:#f5f5f5;
  //             padding: 20px;
  //           }
  //           .foto-print {
  //             max-height: 100%;
  //             max-width: 100%;
  //             border-radius: 10px;
  //             border: 1px solid #ddd;
  //           }
  //           .info-container {
  //             width: 60%;
  //             padding: 20px;
  //             display: flex;
  //             flex-direction: column;
  //             justify-content: space-between;
  //           }
  //           .qr-container {
  //             display: flex;
  //             justify-content: center;
  //             margin-top: 10px;
  //           }
  //           .logo-print {
  //             max-height: 50px;
  //             margin-bottom: 10px;
  //           }
  //                       /* ===================================================
  //           🔹 Estilo especial para credenciales de INSTRUCTORES
  //           =================================================== */
  //         .credencial-instructor {
  //           flex-direction: column;           /* Los elementos van uno abajo del otro */
  //           text-align: center;
  //           align-items: center;
  //           width: 400px;
  //           padding: 25px 15px;
  //         }

  //         .credencial-instructor .credencial-logo img {
  //           max-height: 80px;
  //           margin-bottom: 10px;
  //         }

  //         .credencial-instructor .credencial-info {
  //           padding: 0;
  //         }

  //         .credencial-instructor .credencial-info h2 {
  //           font-size: 1.6em;
  //           margin-bottom: 5px;
  //         }

  //         .credencial-instructor .credencial-info p {
  //           margin: 4px 0;
  //         }

  //         .credencial-instructor .credencial-qr {
  //           margin-top: 15px;
  //         }

  //         /* 🔹 Ajuste general del contenedor */
  //         .credencial-wrapper {
  //           text-align: center;
  //         }
  //         </style> 
  //       </head> 
  //       <body> 
  //         <div class="credencial-print"> 
  //           ${
  //             ocultarFoto
  //               ? '' // 👈 Si ocultarFoto es true, no se incluye bloque de foto
  //               : `<div class="foto-container"> ${fotoHTML} </div>`
  //           }
  //           <div class="info-container">
  //             ${logoHTML} 
  //             <div> 
  //               <h2 style="margin: 0 0 10px 0">${nombre}</h2> 
  //               <p><strong>DNI:</strong> ${dni}</p> 
  //               ${escuela ? `<p><strong>Escuela:</strong> ${escuela}</p>` : ''} 
  //               ${categoriaHTML} 
  //               ${dorsalHTML}
  //               ${modalidad ? `<p><strong>Modalidad:</strong> ${modalidad}</p>` : ''} 
  //               ${rol ? `<p><strong>Rol:</strong> ${rol} ${quiereCompetir ? '(También compite)' : ''}</p>` : ''}
  //             </div> 
  //             <div class="qr-container"> 
  //               <img src="${document.querySelector('.qr-canvas')?.toDataURL('image/png')}" alt="QR Code" /> 
  //             </div> 
  //           </div> 
  //         </div> 
  //         <script> 
  //           window.onload = function() { 
  //             setTimeout(() => { window.print(); window.close(); }, 500); 
  //           } 
  //         </script>
  //       </body> 
  //     </html>
  //   `);

  //   ventana.document.close();
  // };

  // // Imprimir dorsal gigante
  // const handlePrintDorsal = () => {
  //   if (!dorsal) {
  //     alert("No hay dorsal asignado todavía");
  //     return;
  //   }

  //   const ventana = window.open('', '_blank');
  //   ventana.document.write(`
  //     <html>
  //       <head>
  //         <title>Imprimir Dorsal</title>
  //         <style>
  //           @media print {
  //             body {
  //               margin: 0;
  //               display: flex;
  //               justify-content: center;
  //               align-items: center;
  //               height: 100vh;
  //             }
  //             .dorsal-print {
  //               font-size: 200px;
  //               font-weight: bold;
  //               text-align: center;
  //               border: 5px solid black;
  //               padding: 50px;
  //               width: 80%;
  //               margin: auto;
  //             }
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="dorsal-print">${dorsal}</div>
  //         <script>
  //           window.onload = function() {
  //             setTimeout(() => { window.print(); window.close(); }, 500);
  //           }
  //         </script>
  //       </body>
  //     </html>
  //   `);
  //   ventana.document.close();
  // };

  return (
    <div className="credencial-wrapper">
      <h4>Tu Credencial</h4>

      {/* Credencial con foto, info y QR */}
      <div ref={credencialRef} className="credencial">
        {logoEscuela && (
          <div className="credencial-logo">
            <img src={logoEscuela} alt="Logo Escuela" />
          </div>
        )}

        {/* 👇 Bloque de foto condicionado */}
        {!ocultarFoto && (
          <div className="credencial-foto">
            {foto ? (
              <img src={foto} alt="Foto del participante" />
            ) : (
              <div className="no-foto">
                <p>No hay foto disponible</p>
              </div>
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
            <p><strong>Rol:</strong> {rol} {quiereCompetir && '(También compite)'}</p>
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
            <button className="btn btn-blue" onClick={handleDownloadCredencial}>
              Descargar Credencial
            </button>
          )}
          {allowPrint && (
            <>
              <button className="btn btn-green" onClick={handlePrint}>
                Imprimir credencial
              </button>
              <button className="btn btn-red" onClick={handlePrintDorsal}>
                Imprimir dorsal
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
