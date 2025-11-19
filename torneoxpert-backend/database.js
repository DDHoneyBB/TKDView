const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path"); // <--- agregado

// 📂 Asegurarse de que la carpeta 'database' existe
const dbFolder = path.join(__dirname);
const dbFile = path.join(dbFolder, "db.sqlite");

// 🧱 Si el archivo no existe, se crea vacío
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, "");
  console.log("📄 Base de datos creada:", dbFile);
}

// 🔌 Conectar a la base de datos
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("❌ Error al abrir la base de datos:", err.message);
  } else {
    console.log("✅ Conectado a la base de datos en", dbFile);
  }
});

module.exports = db;
