// routes/validarCompetidores.js
const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // 🔹 Obtener competidores del instructor (ahora TODOS, no solo 'pendiente')
  router.post("/api/competidores-instructor", (req, res) => {
  const { escuela, instructor } = req.body;
  console.log("📩 Datos recibidos:", req.body);

  if (!escuela || !instructor) {
    console.warn("⚠️ Faltan datos en la solicitud");
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = `
    SELECT id, nombre, dni, escuela, instructor, modalidad, categoria, estado
    FROM competidores
    WHERE escuela = ? AND instructor = ?
    ORDER BY nombre
  `;

  db.all(sql, [escuela, instructor], (err, rows) => {
    if (err) {
      console.error("❌ Error al obtener competidores:", err);
      return res.status(500).json({ error: "Error al obtener competidores" });
    }

    console.log("✅ Competidores encontrados:", rows?.length || 0);

    db.all(`SELECT DISTINCT dni FROM competidores WHERE estado = 'aprobado'`, [], (err2, aprobados) => {
      if (err2) {
        console.error("❌ Error comprobando aprobados:", err2);
        return res.status(500).json({ error: "Error interno al verificar aprobados" });
      }

      const dnisAprobados = new Set((aprobados || []).map(r => String(r.dni)));
      const resultado = (rows || []).map(r => ({
        ...r,
        yaAprobado: dnisAprobados.has(String(r.dni))
      }));

      console.log("✅ Resultado final enviado:", resultado.length);
      res.json(resultado);
    });
  });
});


  // 🔹 Aprobar o rechazar competidor
  router.post("/actualizar-estado", (req, res) => {
    const { id, estado } = req.body;
    if (!id || !estado) return res.status(400).json({ error: "Faltan datos" });

    // Primero obtenemos el competidor para saber su DNI
    db.get(`SELECT dni FROM competidores WHERE id = ?`, [id], (err, fila) => {
      if (err || !fila) {
        console.error("❌ Error obteniendo competidor:", err);
        return res.status(404).json({ error: "Competidor no encontrado" });
      }

      const dni = fila.dni;

      if (estado === "aprobado") {
        // 🔹 Si se aprueba, actualizamos todos los registros con ese mismo DNI a "aprobado" (GLOBAL)
        const sqlGlobal = `UPDATE competidores SET estado = 'aprobado' WHERE dni = ?`;
        db.run(sqlGlobal, [dni], function (err2) {
          if (err2) {
            console.error("❌ Error al actualizar estado global:", err2.message);
            return res.status(500).json({ error: "Error al aprobar globalmente" });
          }

          console.log(`✅ Aprobado globalmente competidor con DNI ${dni}`);
          return res.json({
            message: "Competidor aprobado globalmente",
            aprobadoDNI: dni
          });
        });
      } else {
        // 🔹 Si se rechaza, solo se actualiza esa fila
        const sql = `UPDATE competidores SET estado = ? WHERE id = ?`;
        db.run(sql, [estado, id], function (err3) {
          if (err3) {
            console.error("❌ Error al actualizar estado:", err3.message);
            return res.status(500).json({ error: "Error al actualizar estado" });
          }

          return res.json({
            message: "Competidor actualizado correctamente",
            aprobadoDNI: null
          });
        });
      }
    });
  });

  return router;
};
