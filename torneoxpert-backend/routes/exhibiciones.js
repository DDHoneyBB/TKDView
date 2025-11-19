// routes/exhibiciones.js
module.exports = (app, db) => {
  // Registrar exhibición
  app.post("/exhibiciones", (req, res) => {
    const { competidor_id, rival_id, grupo } = req.body;
    db.run(
      "INSERT INTO exhibiciones (competidor_id, rival_id, grupo) VALUES (?, ?, ?)",
      [competidor_id, rival_id, grupo],
      function (err) {
        if (err) return res.status(500).json({ error: err });
        res.json({ ok: true, id: this.lastID });
      }
    );
  });
};