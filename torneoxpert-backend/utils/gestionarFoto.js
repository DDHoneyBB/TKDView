const fs = require("fs");
const path = require("path");   // ← FALTABA ESTO

/**
 * Elimina una foto después de X milisegundos
 * @param {string} filename - Nombre del archivo
 * @param {number} tiempoMs - Tiempo en milisegundos
 */
function eliminarFotoTemporal(filename, tiempoMs = 120000) {
  if (!filename) return;

  setTimeout(() => {
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("❌ Error eliminando foto temporal:", err);
        else console.log("🗑️ Foto temporal eliminada:", filename);
      });
    }
  }, tiempoMs);
}

module.exports = { eliminarFotoTemporal };
