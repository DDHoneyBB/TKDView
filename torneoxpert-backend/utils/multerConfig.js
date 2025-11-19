// utils/multerConfig.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Carpeta donde se guardarán los archivos subidos
const uploadDir = path.join(__dirname, "..", "uploads");

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para evitar conflictos
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filtrar archivos por tipo (opcional)
const fileFilter = (req, file, cb) => {
  // Solo aceptar imágenes
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
