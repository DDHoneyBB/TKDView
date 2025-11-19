const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // 🔹 Obtener lista de competidores
  router.get("/", (req, res) => {
    db.all("SELECT * FROM competidores WHERE rol = 'competidor'", [], (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    });
  });

  // 🔹 Eliminar competidor
  router.delete("/:id", (req, res) => {
    db.run("DELETE FROM competidores WHERE id = ?", [req.params.id], function (err) {
      if (err) return res.status(500).send(err);
      res.send({ ok: true });
    });
  });

  // 🔹 Obtener competidores por DNI
  router.get("/by-dni", (req, res) => {
    const dnis = req.query.dnis ? req.query.dnis.split(",") : [];
    if (dnis.length === 0) return res.json([]);
    
    const placeholders = dnis.map(() => "?").join(",");
    db.all(`SELECT * FROM competidores WHERE dni IN (${placeholders})`, dnis, (err, rows) => {
      if (err) return res.status(500).send(err);
      // Ordenar según el orden original de los DNI
      const ordenados = dnis.map(dni => rows.find(r => String(r.dni) === String(dni)) || null);
      res.json(ordenados);
    });
  });

    router.post("/mover-competidor", (req, res) => {
    const { competidorId, grupoDestinoDatos } = req.body;

    if (!competidorId || !grupoDestinoDatos) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    db.run(
      `UPDATE competidores SET 
        genero = ?, 
        graduacion = ?, 
        edad = ?, 
        peso = ?, 
        categoria = ? 
      WHERE id = ?`,
      [
        grupoDestinoDatos.genero,
        grupoDestinoDatos.graduacion,
        grupoDestinoDatos.edad,
        grupoDestinoDatos.peso,
        grupoDestinoDatos.categoria,
        competidorId
      ],
      function (err) {
        if (err) return res.status(500).json({ error: "No se pudo mover el competidor" });
        if (this.changes === 0) return res.status(404).json({ error: "Competidor no encontrado" });
        res.json({ ok: true });
      }
    );
  });

  return router;
};
