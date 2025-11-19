const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../database");
const generarDorsal = require("../utils/generarDorsal");
const { eliminarFotoTemporal } = require("../utils/gestionarFoto");

// Configuración Multer
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});
const upload = multer({ storage });

// ---------------- REGISTRAR COMPETIDOR FORMA ----------------
router.post("/forma", upload.single("fotoPerfil"), async (req, res) => {
  try {
    const { nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, logoEscuela, instructor } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;

    const dorsal = await generarDorsal(dni, categoria);

    db.run(
      `INSERT INTO competidores 
      (nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, modalidad, logoEscuela, fotoPerfil, instructor, dorsal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, "forma", logoEscuela, fotoPerfil, instructor, dorsal],
      (err) => {
        if (err) {
          if (req.file) fs.unlinkSync(req.file.path);
          if (err.code === "SQLITE_CONSTRAINT") return res.status(400).json({ error: "El DNI ya está registrado." });
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, dorsal });
      }
    );
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

 // 🔹 Insertar competidor
        const sql = `
          INSERT INTO competidores (
            nombre, dni, edad, genero, altura, peso,
            escuela, rol, graduacion, categoria,
            instructor, modalidad, logoEscuela,
            fotoPerfil, dorsal, estado
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
        `;

// ---------------- REGISTRAR COMPETIDOR COMBATE ----------------
router.post("/combate", upload.single("fotoPerfil"), async (req, res) => {
  try {
    const { nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, logoEscuela, instructor } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;

    const dorsal = await generarDorsal(dni, categoria);

    db.run(
      `INSERT INTO competidores 
      (nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, modalidad, logoEscuela, fotoPerfil, instructor, dorsal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, "combate", logoEscuela, fotoPerfil, instructor, dorsal],
      (err) => {
        if (err) {
          if (req.file) fs.unlinkSync(req.file.path);
          if (err.code === "SQLITE_CONSTRAINT") return res.status(400).json({ error: "El DNI ya está registrado." });
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, dorsal });
      }
    );
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- REGISTRAR COACH ----------------
router.post("/coach", upload.single("fotoPerfil"), async (req, res) => {
  try {
    const { nombre, dni, edad, escuela, instructor } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;

    db.get("SELECT * FROM coaches WHERE dni = ?", [dni], (err, rowExistente) => {
      if (err) { if (req.file) fs.unlinkSync(req.file.path); return res.status(500).json({ error: err.message }); }
      if (rowExistente) { if (req.file) fs.unlinkSync(req.file.path); return res.status(400).json({ error: "El coach ya está registrado" }); }

      eliminarFotoTemporal(fotoPerfil, 120000);

      db.run(
        `INSERT INTO coaches (nombre, dni, edad, escuela, instructor, fotoPerfil) VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, dni, parseInt(edad) || 0, escuela, instructor, fotoPerfil],
        function(err) {
          if (err) { if (req.file) fs.unlinkSync(req.file.path); return res.status(500).json({ error: err.message }); }
          res.json({ success: true, id: this.lastID, fotoTemporal: !!fotoPerfil });
        }
      );
    });
  } catch (err) { if (req.file) fs.unlinkSync(req.file.path); res.status(500).json({ error: err.message }); }
});

// ---------------- REGISTRAR COACH-COMPETIDOR ----------------
router.post("/coach-competidor", upload.single("fotoPerfil"), async (req, res) => {
  try {
    const { nombre, dni, edad, escuela, genero, altura, peso, graduacion, categoria, instructor } = req.body;
    const fotoPerfil = req.file ? req.file.filename : null;

    db.get("SELECT * FROM competidores WHERE dni = ? AND modalidad = ?", [dni, "combate"], async (err, rowExistente) => {
      if (err) { if (req.file) fs.unlinkSync(req.file.path); return res.status(500).json({ error: err.message }); }

      const dorsal = rowExistente ? rowExistente.dorsal : await generarDorsal(dni, categoria);

      // Registrar competidor si no existe
      if (!rowExistente) {
        db.run(
          `INSERT INTO competidores 
          (nombre, dni, edad, genero, altura, peso, escuela, rol, graduacion, categoria, modalidad, instructor, dorsal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [nombre, dni, edad, genero, altura, peso, escuela, "coach", graduacion, categoria, "combate", instructor, dorsal]
        );
      }

      // Registrar coach
      db.get("SELECT * FROM coaches WHERE dni = ?", [dni], (err, coachExistente) => {
        if (err) { if (req.file) fs.unlinkSync(req.file.path); return res.status(500).json({ error: err.message }); }
        if (coachExistente) { if (req.file) fs.unlinkSync(req.file.path); return res.status(400).json({ error: "El coach ya está registrado" }); }

        db.run(
          `INSERT INTO coaches (nombre, dni, edad, escuela, instructor, fotoPerfil) VALUES (?, ?, ?, ?, ?, ?)`,
          [nombre, dni, parseInt(edad) || 0, escuela, instructor, fotoPerfil],
          function(err) {
            if (err) { if (req.file) fs.unlinkSync(req.file.path); return res.status(500).json({ error: err.message }); }
            res.json({ success: true, dorsal, fotoGuardadaPermanentemente: !!fotoPerfil });
          }
        );
      });
    });
  } catch (err) { if (req.file) fs.unlinkSync(req.file.path); res.status(500).json({ error: err.message }); }
});

// ---------------- REGISTRAR ESPECTADOR ----------------
router.post("/espectador", async (req, res) => {
  try {
    const { nombre, dni } = req.body;
    if (!nombre || !dni) return res.status(400).json({ error: "Faltan nombre o DNI" });

    db.run(`INSERT INTO espectadores (nombre, dni) VALUES (?, ?)`, [nombre, dni], function(err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") return res.status(400).json({ error: "El espectador ya está registrado." });
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: this.lastID });
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------------- REGISTRAR EQUIPO FORMA ----------------
router.post("/equipo-forma", async (req, res) => {
  try {
    const { escuela, instructor, nombreEquipo, titulares, suplente } = req.body;
    if (!escuela || !instructor || !nombreEquipo || !titulares || titulares.length !== 5 || !suplente) {
      return res.status(400).json({ error: "Faltan datos o cantidad incorrecta de competidores" });
    }

    const archivoEquipos = path.join(__dirname, "../equipos_formas.json");
    let equipos = [];
    if (fs.existsSync(archivoEquipos)) {
      const contenido = fs.readFileSync(archivoEquipos, "utf-8");
      equipos = contenido ? JSON.parse(contenido) : [];
    }

    const nuevoEquipo = {
      id: Date.now(),
      escuela,
      instructor,
      nombreEquipo,
      titulares,
      suplente,
      fecha: new Date().toISOString()
    };

    equipos.push(nuevoEquipo);
    fs.writeFileSync(archivoEquipos, JSON.stringify(equipos, null, 2));
    res.json({ success: true, equipo: nuevoEquipo });

  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
