// routes/verificarDni.js
const express = require("express");
const router = express.Router();
const { verificarDniGlobal } = require("../utils/verificarDni");

// POST /api/verificar-dni
router.post("/", async (req, res) => {
  const { dni, escuelaActual } = req.body;

  if (!dni) return res.json({ valido: false, error: "DNI no proporcionado" });

  try {
    const conflictos = await verificarDniGlobal(dni, escuelaActual || null);

    if (conflictos.length > 0) {
      return res.json({
        valido: false,
        conflictos,
        mensaje: `El DNI ${dni} ya está registrado en: ${
          conflictos.map(c => `${c.escuela} (${c.instructor})`).join(', ')
        }`
      });
    }

    res.json({ valido: true });
  } catch (error) {
    console.error("Error verificando DNI:", error);
    res.status(500).json({ valido: false, error: "Error interno del servidor" });
  }
});

module.exports = router;
