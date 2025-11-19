// routes/escuelas.js
const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const db = require("../database");
const { verificarDniGlobal } = require("../utils/verificarDni");

// POST /api/escuelas
router.post("/", upload.single("logo"), async (req, res) => {
  const { nombre } = req.body;
  const logo = req.file ? req.file.filename : null;

  if (!nombre || !logo) return res.status(400).json({ message: "Faltan nombre o logo" });

  let instructores = [];
  try {
    instructores = JSON.parse(req.body.instructores || "[]");
  } catch {
    return res.status(400).json({ message: "Formato incorrecto en instructores" });
  }

  if (!Array.isArray(instructores) || instructores.length === 0)
    return res.status(400).json({ message: "Debe ingresar al menos un instructor." });

  // Validación DNIs duplicados en la misma escuela
  const dnisVistos = new Set();
  const dnisDuplicados = [];
  instructores.forEach(i => {
    const dniNorm = i.dni.trim();
    if (dnisVistos.has(dniNorm)) dnisDuplicados.push(dniNorm);
    else dnisVistos.add(dniNorm);
  });
  if (dnisDuplicados.length > 0)
    return res.status(400).json({ message: `DNIs duplicados: ${dnisDuplicados.join(", ")}` });

  // Validación DNIs global
  try {
    const conflictosGlobales = [];
    for (const inst of instructores) {
      const conflictos = await verificarDniGlobal(inst.dni, null);
      if (conflictos.length > 0)
        conflictosGlobales.push({ dni: inst.dni, instructor: inst.nombre, conflictos });
    }

    if (conflictosGlobales.length > 0) {
      const mensajes = conflictosGlobales.map(c => 
        `DNI ${c.dni} (${c.instructor}) registrado en: ${c.conflictos.map(x => `${x.escuela} (${x.instructor})`).join(", ")}`
      );
      return res.status(400).json({ message: mensajes.join("\n") });
    }

    // Guardar escuela
    db.run(
      `INSERT INTO escuelas (nombre, logo, instructores) VALUES (?, ?, ?)`,
      [nombre, logo, JSON.stringify(instructores)],
      function (err) {
        if (err) return res.status(500).json({ message: "Error guardando escuela" });
        res.json({ success: true, id: this.lastID, nombre, instructores, logo });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error validando DNIs globalmente" });
  }
});

// GET /api/escuelas
router.get("/", (req, res) => {
  db.all("SELECT id, nombre, logo FROM escuelas ORDER BY nombre", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error interno" });

    const escuelasConLogos = rows.map(esc => ({
      ...esc,
      logo: esc.logo ? `/uploads/${esc.logo}` : null
    }));
    res.json(escuelasConLogos);
  });
});

router.get("/instructores", (req, res) => {
  db.all("SELECT nombre, instructores FROM escuelas", [], (err, rows) => {
    if (err) {
      console.error("❌ Error obteniendo instructores:", err);
      return res.status(500).json({ error: "Error al obtener instructores" });
    }

    const instructores = [];

    rows.forEach(esc => {
      try {
        const lista = JSON.parse(esc.instructores || "[]");
        lista.forEach(inst => {
          instructores.push({
            nombre: inst.nombre,
            dni: inst.dni,
            escuela: esc.nombre,
          });
        });
      } catch (e) {
        console.error("⚠️ Error parseando instructores de escuela:", esc.nombre);
      }
    });

    res.json(instructores);
  });
});

router.post("/login-instructor", (req, res) => {
  const { nombre, dni } = req.body;

  if (!nombre || !dni) {
    return res.status(400).json({ error: "Faltan datos: nombre o DNI" });
  }

  db.all("SELECT nombre, instructores, logo FROM escuelas", [], (err, rows) => {
    if (err) {
      console.error("❌ Error buscando instructores:", err);
      return res.status(500).json({ error: "Error del servidor" });
    }

    for (const escuela of rows) {
      try {
        const instructores = JSON.parse(escuela.instructores || "[]");

        const encontrado = instructores.find(
          (inst) =>
            inst.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
            inst.dni.trim() === dni.trim()
        );

        if (encontrado) {
          return res.json({
            nombre: encontrado.nombre,
            dni: encontrado.dni,
            escuela: escuela.nombre,
            logo: escuela.logo ? `/uploads/${escuela.logo}` : null,
          });
        }
      } catch (e) {
        console.error("⚠️ Error parseando instructores:", escuela.nombre);
      }
    }

    return res.status(401).json({ error: "Instructor o DNI incorrecto" });
  });
});

router.post("/api/competidores-instructor", (req, res) => {
  const { escuela, instructor } = req.body;
  if (!escuela || !instructor) return res.status(400).json({ error: "Faltan datos" });

  db.all(
    `SELECT id, nombre, dni, genero, edad, graduacion, categoria, modalidad
     FROM competidores
     WHERE escuela = ? AND instructor = ?`,
    [escuela, instructor],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Error interno del servidor" });

      res.json(rows || []);
    }
  );
});

// POST /api/escuelas/:id/instructores → agregar instructores a una escuela existente
router.post("/:id/instructores", async (req, res) => {
  const { id } = req.params;
  const { instructores } = req.body;

  if (!id || !Array.isArray(instructores) || instructores.length === 0) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  db.get("SELECT instructores FROM escuelas WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(404).json({ message: "Escuela no encontrada" });

    let listaActual = JSON.parse(row.instructores || "[]");
    const nuevos = instructores.filter(
      (i) => !listaActual.some((ex) => ex.dni === i.dni)
    );
    listaActual = [...listaActual, ...nuevos];

    db.run(
      "UPDATE escuelas SET instructores = ? WHERE id = ?",
      [JSON.stringify(listaActual), id],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Error al guardar instructores" });
        res.json({ success: true, agregados: nuevos.length });
      }
    );
  });
});
module.exports = router;