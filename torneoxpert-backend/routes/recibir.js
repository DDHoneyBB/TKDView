const express = require("express");
const db = require("../database");

module.exports = (tatamiValores, tatamiData, crearTatamiVacio) => {
  const router = express.Router();
  tatamiData = {};
  function crearTatamiVacio() {
    return { valores: [] };
  }

  // ✅ Recibir datos desde PLAYERPANEL PAGE
  router.post("/enviar/panel", (req, res) => {
    const { tatamiId, ...datos } = req.body;
    if (!tatamiId) return res.status(400).json({ error: "Falta tatamiId" });

    tatamiValores[tatamiId] = datos;
    console.log(`✅ Datos recibidos del Tatami ${tatamiId}:`, datos);
    res.json({ ok: true, mensaje: "Datos almacenados correctamente" });
  });

  // ✅ Recibir de combate
  /*router.post("/control-combate", (req, res) => {
    const { tatami, accion, estado } = req.body;
    console.log(`Control combate - Tatami: ${tatami}, Acción: ${accion}`);
    res.json({ success: true, mensaje: `Combate ${accion} para tatami ${tatami}`, estado });
  });*/

// ✅ Recibir desde controles
  router.post("/enviar", (req, res) => {
    const { tatamiId, ...datos } = req.body;

    if (!tatamiId) {
      return res.status(400).json({ error: "Falta tatamiId" });
    }

    tatamiData[tatamiId] = datos;
    console.log(`✅ Datos recibidos del Tatami ${tatamiId}:`, datos);

    const ahora = new Date();
    const horaLegible = ahora.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const juez = datos.tipo || "Desconocido";
    const competidor = datos.competidorNombre || "Desconocido";
    const valor = datos.competidorPuntos || 0;

    // 💾 Guardamos directamente la hora legible en la columna 'fecha'
    const sql = `
      INSERT INTO registros_recibir (fecha, juez, competidor, valor, id_tatami)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(sql, [horaLegible, juez, competidor, valor, tatamiId], function (err) {
      if (err) {
        console.error("❌ Error al guardar en DB:", err);
        return res.status(500).json({ error: "Error al guardar en base de datos" });
      }

      res.json({
        ok: true,
        reenviado: true,
        id: this.lastID,
        hora: horaLegible,
        juez,
        competidor,
        valor,
      });
    });
  });

    // 🔄 Recibir valores de un tatami
  router.post("/valores", (req, res) => {
    const tatami = req.query.tatami || "1";
    if (!tatamiData[tatami]) tatamiData[tatami] = crearTatamiVacio();
    tatamiData[tatami].valores = req.body;
    console.log(`📥 Valores actualizados para tatami ${tatami}:`, req.body);
    res.json({ ok: true, tatami, valores: tatamiData[tatami].valores });
  });

  // ✅ Enviar valores para panel
  router.get("/valores/panel", (req, res) => {
    const tatamiId = req.query.tatami;
    if (!tatamiId) return res.status(400).json({ error: "Falta parámetro tatami" });

    const valores = tatamiValores[tatamiId];
    res.json(valores || {});
  });

  // ✅ Enviar datos al lector
  router.get("/valores/controles", (req, res) => {
    const tatamiId = req.query.tatami;
    //console.log("📤 Solicitud de datos para controles - Tatami:", tatamiId);
    if (tatamiId === undefined || tatamiId === null) {
      return res.status(400).json({ error: "Falta parámetro tatami" });
    }
    console.log("📤 Datos enviados para controles - Tatami:", tatamiData);//Problema
    const valores = tatamiData[tatamiId];
    res.json(valores || {});
  });

       // ==============================
// 🧹 LIMPIAR REGISTROS DEL TATAMI (DB + MEMORIA)
// ==============================
router.delete("/registros/:tatamiId", (req, res) => {
  const { tatamiId } = req.params;

  db.run("DELETE FROM registros_recibir WHERE id_tatami = ?", [tatamiId], (err) => {
    if (err) {
      console.error("❌ Error al limpiar registros:", err);
      return res.status(500).json({ error: "Error al limpiar registros" });
    }

    // 🧠 También limpiamos memoria temporal
    if (tatamiData[tatamiId]) {
      delete tatamiData[tatamiId];
      console.log(`🧠 Memoria de tatamiData[${tatamiId}] limpiada`);
    }
    if (tatamiValores[tatamiId]) {
      delete tatamiValores[tatamiId];
      console.log(`🧠 Memoria de tatamiValores[${tatamiId}] limpiada`);
    }

    console.log(`✅ Registros y memoria del tatami ${tatamiId} eliminados`);
    res.json({ ok: true, mensaje: `Registros y memoria del tatami ${tatamiId} limpiados` });
  });
});


  // 📦 Obtener valores de un tatami
  router.get("/valores", (req, res) => {
    const tatami = req.query.tatami || "1";
    if (!tatamiData[tatami]) tatamiData[tatami] = crearTatamiVacio();
    res.json(tatamiData[tatami].valores || {});
  });

  // Endpoint para obtener registros por tatami
  router.get("/registros/:tatamiId", (req, res) => {
    const tatamiId = req.params.tatamiId;
    const sql = `SELECT * FROM registros_recibir WHERE id_tatami = ? ORDER BY fecha ASC`;

    db.all(sql, [tatamiId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al obtener registros" });
      }
      res.json(rows);
    });
  });

  router.delete("/registros/:tatamiId/:jugador?", (req, res) => {
    const { tatamiId, jugador } = req.params;

    let sql = "DELETE FROM registros_recibir WHERE id_tatami = ?";
    const params = [tatamiId];

    if (jugador === "0") {
      sql += " AND competidor = ?";
      params.push("jugador1");
    } else if (jugador === "1") {
      sql += " AND competidor = ?";
      params.push("jugador2");
    }

    db.run(sql, params, function(err) {
      if (err) {
        console.error("❌ Error al eliminar registros:", err);
        return res.status(500).json({ error: "Error al eliminar registros" });
      }

      res.json({ ok: true, eliminado: this.changes }); // this.changes = cantidad de filas borradas
    });
  });

  return router;
};
