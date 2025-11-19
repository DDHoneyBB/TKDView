// routes/ingreso.js

module.exports = (app, db) => {
  // ==================== RUTAS DE INGRESO ====================

  // Registrar ingreso
  app.post("/ingreso", (req, res) => {
    const { dni } = req.body;
    db.run(
      "UPDATE competidores SET ingreso = 1 WHERE dni = ?",
      [dni],
      function (err) {
        if (err) return res.status(500).send(err);
        if (this.changes === 0) return res.status(404).send("No encontrado");
        res.send({ ok: true });
      }
    );
  });

  // Verificar ingreso
  app.get("/ingreso/:dni", (req, res) => {
    const dni = req.params.dni;
    db.get(
      "SELECT ingreso FROM competidores WHERE dni = ?",
      [dni],
      (err, row) => {
        if (err) return res.status(500).send(err);
        if (!row) return res.status(404).send("No encontrado");
        res.send({ ingreso: !!row.ingreso });
      }
    );
  });
};
