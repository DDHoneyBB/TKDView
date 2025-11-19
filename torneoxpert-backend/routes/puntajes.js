const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // ✅ Obtener todos los puntajes
  router.get("/puntajes", (req, res) => {
    db.all("SELECT * FROM puntajes ORDER BY id DESC", [], (err, rows) => {
      if (err) {
        console.error("❌ Error al obtener puntajes:", err);
        return res.status(500).json({ error: "Error al obtener puntajes" });
      }
      res.json(rows);
    });
  });

  // ✅ Registrar un nuevo puntaje manual o del sistema
  router.post("/aceptar-puntaje", (req, res) => {
    const { jugador, id, total } = req.body;

    if (!jugador || total === undefined) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const sql = `
      INSERT INTO puntajes (juez, competidor, tatami_id, puntos, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    db.run(sql, ["Sistema", jugador, id, total], (err) => {
      if (err) {
        console.error("❌ Error al guardar puntaje:", err.message);
        return res.status(500).json({ error: "Error al guardar puntaje" });
      }
      console.log(`✅ Puntaje guardado (Sistema): ${jugador} (${total} pts)`);
      res.json({ success: true, message: "Puntaje guardado correctamente" });
    });
  });

  // ✅ Alias para aceptar puntajes desde controles remotos
  router.post("/puntajes", (req, res) => {
    const { jugador, id, total } = req.body;

    if (!jugador || !id || total == null) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const sql = `
      INSERT INTO puntajes (juez, competidor, tatami_id, puntos, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    db.run(sql, ["ControlRemoto", jugador, id, total], (err) => {
      if (err) {
        console.error("❌ Error guardando puntaje desde /puntajes:", err.message);
        return res.status(500).json({ error: "Error al guardar puntaje" });
      }
      console.log(`✅ Puntaje guardado (ControlRemoto): ${jugador} (${total} pts)`);
      res.json({ success: true, message: "Puntaje guardado correctamente" });
    });
  });

  return router;
};
