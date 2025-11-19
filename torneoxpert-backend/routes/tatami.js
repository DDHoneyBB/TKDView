const express = require("express");
const router = express.Router();
const db = require("../database");

// 🧠 Memorias temporales
const tatamiValores = {};
const tatamiData = {};

// 🧩 Función para crear un tatami vacío
const crearTatamiVacio = () => ({
  competidorRojo: null,
  competidorAzul: null,
  puntosRojo: 0,
  puntosAzul: 0,
  cronometro: "00:00",
  estado: "espera",
  valores: {},
});

// 🆕 Crear un nuevo tatami
router.get("/crear-tatami", (req, res) => {
  const tatami = req.query.tatami;

  if (!tatami) {
    return res.status(400).json({ error: "Debe especificar el número de tatami" });
  }

  // Si el tatami no existe, lo creamos
  if (!tatamis[tatami]) {
    tatamis[tatami] = crearTatamiVacio();
    console.log(`✅ Tatami ${tatami} creado`);
    return res.json({ ok: true, tatami, mensaje: `Tatami ${tatami} creado` });
  } else {
    console.log(`⚠️ Tatami ${tatami} ya existe`);
    return res.json({ ok: false, tatami, mensaje: `El tatami ${tatami} ya existe` });
  }
});

router.post("/crear-tatami", (req, res) => {
  const { numero, nombre, ubicacion } = req.query;

  // Valores por defecto si no se envían
  const numeroFinal = numero || Math.floor(Math.random() * 10) + 1;
  const nombreFinal = nombre || `Tatami ${numeroFinal}`;
  const ubicacionFinal = ubicacion || "Zona Principal";

  db.run(
    `
    INSERT INTO tatamis (numero, nombre, ubicacion, estado)
    VALUES (?, ?, ?, 'activo')
    `,
    [numeroFinal, nombreFinal, ubicacionFinal],
    function (err) {
      if (err) {
        console.error("❌ Error al crear tatami:", err);
        return res.status(500).json({ error: "Error al crear tatami", detalles: err.message });
      }

      console.log(`✅ Tatami creado: ${nombreFinal} (ID ${this.lastID})`);

      res.json({
        ok: true,
        id: this.lastID,
        mensaje: "Tatami creado exitosamente",
        tatami: {
          id: this.lastID,
          numero: numeroFinal,
          nombre: nombreFinal,
          ubicacion: ubicacionFinal,
          estado: "activo",
        },
      });
    }
  );
});

// 🧹 Reset de un tatami
router.post("/reset", (req, res) => {
  const tatami = req.query.tatami || "1";
  tatamiData[tatami] = crearTatamiVacio();
  console.log(`♻️ Reset realizado para tatami ${tatami}`);
  res.json({ ok: true, tatami, mensaje: "Reset realizado" });
});

 // ============================
  // 🏆 ESTADO DE GANADORES
  // ============================

  // Obtener ganadores
  router.get("/estado-ganadores", (req, res) => {
    const tatami = req.query.tatami || "1";
    if (!tatamiData[tatami]) tatamiData[tatami] = crearTatamiVacio();
    res.json(tatamiData[tatami].ganadores || {});
  });

  // Actualizar ganadores
  router.post("/estado-ganadores", (req, res) => {
    const tatami = req.query.tatami || "1";
    if (!tatamiData[tatami]) tatamiData[tatami] = crearTatamiVacio();
    tatamiData[tatami].ganadores = req.body;
    console.log(`🏅 Ganadores actualizados en tatami ${tatami}:`, req.body);
    res.json({ ok: true, tatami, ganadores: tatamiData[tatami].ganadores });
  });

  // Obtener ganadores completos
  router.get("/ganadores-completos", (req, res) => {
    const tatami = req.query.tatami || "1";
    if (!tatamiData[tatami]) tatamiData[tatami] = crearTatamiVacio();
    res.json(tatamiData[tatami].ganadoresCompletos || []);
  });

  // Agregar un ganador completo
  router.post("/ganadores-completos", (req, res) => {
    const tatami = req.query.tatami || "1";
    if (!tatamiData[tatami]) tatamiData[tatami] = crearTatamiVacio();
    tatamiData[tatami].ganadoresCompletos.push(req.body);
    console.log(`🏆 Ganador agregado en tatami ${tatami}:`, req.body);
    res.json({
      ok: true,
      tatami,
      ganadoresCompletos: tatamiData[tatami].ganadoresCompletos,
    });
  });

  // ============================
  // 🗑️ BORRAR TATAMI (Base de datos)
  // ============================

  router.post("/borrar-tatami", (req, res) => {
    const { tatami_id } = req.body;

    if (!tatami_id) {
      return res.status(400).json({ error: "Se requiere el ID del tatami" });
    }

    console.log(`🗑️ Solicitando borrar tatami ID: ${tatami_id}`);

    // Verificar si el tatami existe
    db.get("SELECT * FROM tatamis WHERE id = ?", [tatami_id], (err, tatami) => {
      if (err) {
        console.error("Error buscando tatami:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      if (!tatami) {
        return res
          .status(404)
          .json({ error: `Tatami ${tatami_id} no encontrado` });
      }

      // Transacción para borrar combates y tatami
      db.serialize(() => {
        // 1️⃣ Borrar combates asociados
        db.run(
          "DELETE FROM combates_tatami WHERE tatami_id = ?",
          [tatami_id],
          function (err) {
            if (err) {
              console.error("Error eliminando combates:", err);
              return res
                .status(500)
                .json({ error: "Error al eliminar combates asociados" });
            }

            const combatesEliminados = this.changes;
            console.log(`Combates eliminados: ${combatesEliminados}`);

            // 2️⃣ Borrar el tatami
            db.run(
              "DELETE FROM tatamis WHERE id = ?",
              [tatami_id],
              function (err) {
                if (err) {
                  console.error("Error eliminando tatami:", err);
                  return res
                    .status(500)
                    .json({ error: "Error al eliminar el tatami" });
                }

                if (this.changes === 0) {
                  return res
                    .status(404)
                    .json({ error: "Tatami no encontrado" });
                }

                console.log(`✅ Tatami ${tatami_id} eliminado exitosamente`);

                res.json({
                  success: true,
                  message: `Tatami ${tatami_id} borrado exitosamente`,
                  tatami_borrado: {
                    id: tatami.id,
                    numero: tatami.numero,
                    nombre: tatami.nombre,
                  },
                  combates_eliminados: combatesEliminados,
                });
              }
            );
          }
        );
      });
    });
  });

    // ==========================
  // ✅ Obtener todos los tatamis
  // ==========================
  router.get("/tatamis", (req, res) => {
    db.all(`
      SELECT t.*, 
             COUNT(ct.id) as combates_pendientes,
             COUNT(CASE WHEN ct.estado = 'en_curso' THEN 1 END) as combates_curso
      FROM tatamis t
      LEFT JOIN combates_tatami ct ON t.id = ct.tatami_id AND ct.estado IN ('pendiente', 'en_curso')
      GROUP BY t.id
      ORDER BY t.numero
    `, [], (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    });
  });

  // ==========================
  // ✅ Crear nuevo tatami
  // ==========================
  router.post("/tatamis", (req, res) => {
    const { numero, nombre, estado } = req.body;
    db.run(
      "INSERT INTO tatamis (numero, nombre, estado) VALUES (?, ?, ?)",
      [numero, nombre, estado || "activo"],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, numero, nombre, estado: estado || "activo" });
      }
    );
  });

  // ==========================
  // ✅ Información específica de un tatami
  // ==========================
  router.get("/tatami/:id", (req, res) => {
    const tatamiId = req.params.id;

    db.get(`
      SELECT t.*,
             (SELECT COUNT(*) FROM combates_tatami WHERE tatami_id = t.id AND estado = 'pendiente') as combates_pendientes,
             (SELECT COUNT(*) FROM combates_tatami WHERE tatami_id = t.id AND estado = 'finalizado') as combates_finalizados
      FROM tatamis t
      WHERE t.id = ?
    `, [tatamiId], (err, tatami) => {
      if (err) return res.status(500).send(err);
      if (!tatami) return res.status(404).json({ error: "Tatami no encontrado" });
      res.json(tatami);
    });
  });

  // ==========================
  // ✅ Asignar combate a tatami
  // ==========================
  router.post("/tatami/:id/asignar-combate", (req, res) => {
    const tatamiId = req.params.id;
    const { combate_grupo, competidor_rojo_id, competidor_azul_id, orden } = req.body;

    db.get(`
      SELECT id FROM combates_tatami 
      WHERE combate_grupo = ? AND (competidor_rojo_id = ? OR competidor_azul_id = ?)
    `, [combate_grupo, competidor_rojo_id, competidor_azul_id], (err, existing) => {
      if (err) return res.status(500).send(err);
      if (existing) return res.status(400).json({ error: "Este combate ya está asignado a un tatami" });

      db.run(`
        INSERT INTO combates_tatami (tatami_id, combate_grupo, competidor_rojo_id, competidor_azul_id, orden)
        VALUES (?, ?, ?, ?, ?)
      `, [tatamiId, combate_grupo, competidor_rojo_id, competidor_azul_id, orden || 0], function(err) {
        if (err) return res.status(500).send(err);

        // Actualizar categoría actual del tatami basado en competidor rojo
        db.get(`SELECT categoria FROM competidores WHERE id = ?`, [competidor_rojo_id], (err, competidor) => {
          if (!err && competidor) {
            db.run(`UPDATE tatamis SET categoria_actual = ? WHERE id = ?`, [competidor.categoria, tatamiId]);
          }
        });

        res.json({ id: this.lastID, message: "Combate asignado al tatami" });
      });
    });
  });

  // ==========================
  // ✅ Obtener competidores por tatami
  // ==========================
  router.get("/tatami/:id/api/competidores", (req, res) => {
    const tatamiId = req.params.id;

    db.all(`
      SELECT DISTINCT c.* 
      FROM competidores c
      JOIN combates_tatami ct ON (c.id = ct.competidor_rojo_id OR c.id = ct.competidor_azul_id)
      WHERE ct.tatami_id = ?
      ORDER BY c.nombre
    `, [tatamiId], (err, rows) => {
      if (err) return res.status(500).send(err);

      const competidores = rows.map(c => ({
        ...c,
        fotoPerfil: c.fotoPerfil ? `/uploads/${c.fotoPerfil}` : null
      }));
      res.json(competidores);
    });
  });

  // ==========================
  // ✅ Actualizar estado del tatami
  // ==========================
  router.put("/tatami/:id/estado", (req, res) => {
    const tatamiId = req.params.id;
    const { estado } = req.body;

    db.run(`UPDATE tatamis SET estado = ? WHERE id = ?`, [estado, tatamiId], function(err) {
      if (err) return res.status(500).send(err);
      if (this.changes === 0) return res.status(404).json({ error: "Tatami no encontrado" });
      res.json({ message: "Estado del tatami actualizado" });
    });
  });

  // ==========================
  // ✅ Endpoint historial de combates de un tatami
  // ==========================
  router.get("/tatami/:id/historial", (req, res) => {
    const tatamiId = req.params.id;

    db.all(`
      SELECT ct.*,
             cr.nombre as competidor_rojo_nombre,
             cr.id as competidor_rojo_id,
             cr.escuela as competidor_rojo_escuela,
             ca.nombre as competidor_azul_nombre,
             ca.id as competidor_azul_id,
             ca.escuela as competidor_azul_escuela,
             CASE 
               WHEN ct.ganador_id = cr.id THEN cr.id
               WHEN ct.ganador_id = ca.id THEN ca.id
               ELSE NULL 
             END as ganador_id,
             ct.puntos_rojo,
             ct.puntos_azul
      FROM combates_tatami ct
      LEFT JOIN competidores cr ON ct.competidor_rojo_id = cr.id
      LEFT JOIN competidores ca ON ct.competidor_azul_id = ca.id
      WHERE ct.tatami_id = ? AND ct.estado = 'finalizado'
      ORDER BY ct.fecha_fin DESC
      LIMIT 20
    `, [tatamiId], (err, combates) => {
      if (err) return res.status(500).json({ error: "Error interno del servidor" });

      const historial = combates.map(c => ({
        id: c.id,
        competidor1: { id: c.competidor_rojo_id, nombre: c.competidor_rojo_nombre, escuela: c.competidor_rojo_escuela },
        competidor2: { id: c.competidor_azul_id, nombre: c.competidor_azul_nombre, escuela: c.competidor_azul_escuela },
        puntosCompetidor1: c.puntos_rojo || 0,
        puntosCompetidor2: c.puntos_azul || 0,
        ganador: c.ganador_id,
        grupo: c.combate_grupo,
        fecha: c.fecha_fin,
        roundActual: c.round_actual || 1
      }));

      res.json(historial);
    });
  });

 router.get("/lista-tatamis", (req, res) => {
    db.all(`
      SELECT t.*, 
             COUNT(ct.id) as total_combates,
             COUNT(CASE WHEN ct.estado = 'finalizado' THEN 1 END) as combates_finalizados
      FROM tatamis t
      LEFT JOIN combates_tatami ct ON t.id = ct.tatami_id
      GROUP BY t.id
      ORDER BY t.numero
    `, [], (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    });
  });

 // ==========================
  // 🔹 Asignar llave a un tatami
  // ==========================
  router.post("/asignar-llave-tatami", (req, res) => {
    const { tatamiId, grupo, ronda, competidorRojoId, competidorAzulId, orden } = req.body;
    
    if (!tatamiId || !grupo || !competidorRojoId || !competidorAzulId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    db.run(`
      INSERT INTO combates_tatami (tatami_id, combate_grupo, competidor_rojo_id, competidor_azul_id, orden)
      VALUES (?, ?, ?, ?, ?)
    `, [tatamiId, grupo, competidorRojoId, competidorAzulId, orden || 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: "Combate de llave asignado al tatami" });
    });
  });

  // ==========================
  // 🔹 Iniciar combate en tatami
  // ==========================
  router.post("/tatami/:id/iniciar-combate/:combateId", (req, res) => {
    const { id: tatamiId, combateId } = req.params;
    
    // Detener cualquier combate en curso
    db.run(`
      UPDATE combates_tatami 
      SET estado = 'pendiente' 
      WHERE tatami_id = ? AND estado = 'en_curso'
    `, [tatamiId], (err) => {
      if (err) return res.status(500).send(err);

      // Iniciar el nuevo combate
      db.run(`
        UPDATE combates_tatami 
        SET estado = 'en_curso', fecha_inicio = CURRENT_TIMESTAMP 
        WHERE id = ? AND tatami_id = ?
      `, [combateId, tatamiId], function(err) {
        if (err) return res.status(500).send(err);
        if (this.changes === 0) return res.status(404).json({ error: "Combate no encontrado" });

        // Reiniciar sistema de puntuación (variables globales)
        global.horaDeInicio = Date.now();
        global.total1 = 0;
        global.total2 = 0;

        res.json({ message: "Combate iniciado" });
      });
    });
  });

  // ==========================
  // 🔹 Finalizar combate en tatami
  // ==========================
  router.post("/tatami/:id/finalizar-combate/:combateId", (req, res) => {
    const { id: tatamiId, combateId } = req.params;
    const { ganador_id, puntos_rojo, puntos_azul } = req.body;
    
    db.run(`
      UPDATE combates_tatami 
      SET estado = 'finalizado', 
          ganador_id = ?, 
          puntos_rojo = ?, 
          puntos_azul = ?, 
          fecha_fin = CURRENT_TIMESTAMP
      WHERE id = ? AND tatami_id = ?
    `, [ganador_id, puntos_rojo || global.ultimoResultado?.total1, puntos_azul || global.ultimoResultado?.total2, combateId, tatamiId], function(err) {
      if (err) return res.status(500).send(err);
      if (this.changes === 0) return res.status(404).json({ error: "Combate no encontrado" });

      // Registrar ganador en sistema de llaves (opcional)
      db.get(`
        SELECT combate_grupo FROM combates_tatami WHERE id = ?
      `, [combateId], (err, combate) => {
        if (!err && combate) {
          console.log(`Combate finalizado en grupo: ${combate.combate_grupo}`);
        }
      });

      res.json({ message: "Combate finalizado" });
    });
  });

  // ==========================
  // ✅ Combina llaves y tatamis (Visor Global)
  // ==========================
  router.get("/llaves-con-tatamis", (req, res) => {
    const sql = `
      SELECT 
        l.grupo,
        l.modalidad,
        t.id AS tatami_id,
        t.nombre AS tatami_nombre,
        ct.estado AS estado_combate,
        ct.combate_grupo,
        cr.nombre AS competidor_rojo,
        ca.nombre AS competidor_azul
      FROM llaves l
      LEFT JOIN combates_tatami ct ON l.grupo = ct.combate_grupo
      LEFT JOIN tatamis t ON ct.tatami_id = t.id
      LEFT JOIN competidores cr ON ct.competidor_rojo_id = cr.id
      LEFT JOIN competidores ca ON ct.competidor_azul_id = ca.id
      GROUP BY l.grupo, l.modalidad, t.id
      ORDER BY t.id, l.grupo;
    `;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: "Error al obtener datos" });
      res.json(rows || []);
    });
  });

module.exports = router;

