// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");

// ==================== CONFIGURACIÓN INICIAL ====================
const app = express();

// 🔧 Evitar respuestas 304 Not Modified y caché no deseado
app.disable("etag");
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// ==================== BASE DE DATOS ====================
const db = require("./database"); // Conexión SQLite
const setupDatabase = require("./utils/databaseSetup");

setupDatabase(db);



// ==================== MIDDLEWARES ====================
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://torneoxpert.com", // Producción
      "http://localhost:3000",   // Desarrollo frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ==================== ARCHIVOS ESTÁTICOS ====================
app.use("/avatars", express.static(path.join(__dirname, "public/avatars")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== VARIABLES GLOBALES ====================
let tatamis = {
  1: { valores: {}, ganadores: {}, ganadoresCompletos: [], timerCentral: 120 }, // 120 segundos = 2 min
  2: { valores: {}, ganadores: {}, ganadoresCompletos: [], timerCentral: 120 },
  3: { valores: {}, ganadores: {}, ganadoresCompletos: [], timerCentral: 120 },
};

let transmisionesActivas = [];

// ==================== UTILIDADES ====================
const { generarDorsal } = require("./utils/generarDorsal");

// ==================== RUTAS ====================

// 📦 Escuelas y DNI
app.use("/escuelas", require("./routes/escuelas"));
app.use("/api/verificar-dni-unico", require("./routes/verificarDni"));

// 📦 Inscripciones
app.use("/register", require("./routes/inscripciones"));

// 📦 Ingreso + Validación
require("./routes/ingreso")(app, db);
app.use("/api/validaringreso", require("./routes/validarIngreso"));

app.get("/api/validaringreso/usuarios/ingresados", async (req, res) => {
  try {
    const ingresados = await db.query(`
      SELECT dni, nombre, rol, horaIngreso 
      FROM ingresos 
      WHERE fecha = CURDATE() 
      ORDER BY horaIngreso DESC
    `);
    res.json({ ingresados });
  } catch (error) {
    res.status(500).json({ error: "Error al cargar ingresados" });
  }
});

// ✅ NUEVA RUTA: Control de Combate
app.use("/api", require("./routes/controlCombate"));

// 📦 Tatamis
app.use("/api", require("./routes/recibir")(tatamis));

// 📦 Competidores
app.use("/api/competidores", require("./routes/competidores")(db));

// 📦 Validación de competidores
app.use("/api/validar", require("./routes/validarCompetidores")(db));

// 📦 Transmisiones
app.use("/api", require("./routes/transmisiones")());

// 📦 Brackets y combates
require("./routes/bracketsCombate")(app, db);
require("./routes/bracketsForma")(app, db);
require("./routes/llaves")(app, db);
require("./routes/exhibiciones")(app, db);

// 📦 Equipos
require("./routes/equipos")(app, db);

// 📦 Tatamis adicionales
app.use("/api", require("./routes/tatami"));

// 📦 Exportar base a Excel
require("./routes/exportarDB")(app, db);

// 📦 Controles
app.use("/api/controles", require("./routes/Controles"));

// 📦 Timer (ajustar y consultar tiempo central)
require("./routes/timer")(app, db, tatamis);

// ==================== FRONTEND (React + Vite) ====================
/*const FRONTEND_PATH = "/var/www/torneoxpert-frontend/dist";

app.use(express.static(FRONTEND_PATH));

app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "index.html"));
}); */


// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});
