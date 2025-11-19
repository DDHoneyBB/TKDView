// routes/bracketsForma.js
const { getRangoEdad, getRangoPeso, getRangoGraduacion, buscarRivalExhibicion } = require("../utils/rangos");

// Edad:
const rangoEdad = getRangoEdad(16);

module.exports = (app, db) => {
  // ==================== BRACKETS DE FORMA ====================

  // Obtener brackets de forma
  app.get("/api/brackets-forma", (req, res) => {
  console.log("📊 Cargando brackets de forma...");

  const sql = `
    SELECT c.*, e.logo AS logo_escuela
    FROM competidores c
    LEFT JOIN escuelas e ON c.escuela = e.nombre
    WHERE (c.modalidad = 'forma' OR c.modalidad = 'ambos')
AND c.estado = 'aprobado'

  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).send(err);

    db.all("SELECT * FROM bracket_orden", [], (errOrd, ordenes) => {
      if (errOrd) return res.status(500).send(errOrd);

      const ordenMap = {};
      ordenes.forEach(o => {
        if (!ordenMap[o.grupo]) ordenMap[o.grupo] = {};
        ordenMap[o.grupo][o.dni] = o.orden;
      });

      const grupos = {};
      rows.forEach(c => {
        c.logo_url = c.logo_escuela ? `${c.logo_escuela}` : null;
        const rangoEdad = getRangoEdad(Number(c.edad));
        const rangoGraduacion = getRangoGraduacion(c.graduacion || "");
        const key = `${c.genero}-${rangoGraduacion}-${rangoEdad}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(c);
      });

      const brackets = [];
      const MAX_PER_GROUP = 8; // Ajustable

      Object.entries(grupos).forEach(([grupo, competidoresGrupo]) => {
        const ordenGuardado = ordenMap[grupo];
        if (ordenGuardado) {
          competidoresGrupo.sort((a, b) => (ordenGuardado[a.dni] ?? 9999) - (ordenGuardado[b.dni] ?? 9999));
        }

        for (let i = 0; i < competidoresGrupo.length; i += MAX_PER_GROUP) {
          const subgrupo = competidoresGrupo.slice(i, i + MAX_PER_GROUP);
          const ronda = [];
          for (let j = 0; j < subgrupo.length; j += 2) {
            ronda.push({ a: subgrupo[j]?.nombre || null, b: subgrupo[j + 1]?.nombre || null });
          }

          brackets.push({
            grupo: `${grupo}${competidoresGrupo.length > MAX_PER_GROUP ? `-${Math.floor(i / MAX_PER_GROUP) + 1}` : ""}`,
            // Todas las etapas vacías inicialmente
            ronda,
            octavos: Array(8).fill(null),
            cuartos: Array(4).fill(null),
            semis: Array(2).fill(null),
            final: [null],
            modalidad: "forma",
            competidores: subgrupo,
            dnis: subgrupo.map(c => c.dni)
          });
        }
      });

      // Cargar llaves previas
      db.all("SELECT * FROM llaves", [], (err2, rowsLlaves) => {
        if (err2) return res.status(500).send(err2);

        brackets.forEach(estructura => {
          rowsLlaves.forEach(({ grupo, etapa, ganador, modalidad }) => {
            if (modalidad === "forma" && estructura.grupo === grupo) {
              if (etapa === "octavos1") estructura.octavos[0] = ganador;
              if (etapa === "octavos2") estructura.octavos[1] = ganador;
              if (etapa === "octavos3") estructura.octavos[2] = ganador;
              if (etapa === "octavos4") estructura.octavos[3] = ganador;
              if (etapa === "octavos5") estructura.octavos[4] = ganador;
              if (etapa === "octavos6") estructura.octavos[5] = ganador;
              if (etapa === "octavos7") estructura.octavos[6] = ganador;
              if (etapa === "octavos8") estructura.octavos[7] = ganador;

              if (etapa === "cuartos1") estructura.cuartos[0] = ganador;
              if (etapa === "cuartos2") estructura.cuartos[1] = ganador;
              if (etapa === "cuartos3") estructura.cuartos[2] = ganador;
              if (etapa === "cuartos4") estructura.cuartos[3] = ganador;

              if (etapa === "semis1") estructura.semis[0] = ganador;
              if (etapa === "semis2") estructura.semis[1] = ganador;

              if (etapa === "final1") estructura.final[0] = ganador;
            }
          });
        });

        res.json({ brackets });
      });
    });
  });
});

// Obtener brackets de forma
app.get("/api/generar-brackets-forma", (req, res) => {
  console.log("🌀 Generando brackets aleatorios para modalidad 'forma' (respetando órdenes existentes)...");

  const sql = `
    SELECT c.*, e.logo AS logo_escuela
    FROM competidores c
    LEFT JOIN escuelas e ON c.escuela = e.nombre
    WHERE (c.modalidad = 'forma' OR c.modalidad = 'ambos')
AND c.estado = 'aprobado'

  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).send(err);

    // 1️⃣ Cargar órdenes ya guardados
    db.all("SELECT * FROM bracket_orden", [], (errOrd, ordenesGuardadas) => {
      if (errOrd) return res.status(500).send(errOrd);

      const ordenMap = {};
      ordenesGuardadas.forEach(o => {
        if (!ordenMap[o.grupo]) ordenMap[o.grupo] = {};
        ordenMap[o.grupo][o.dni] = o.orden;
      });

      // 2️⃣ Agrupar competidores por género, graduación y edad
      const grupos = {};
      rows.forEach(c => {
        c.logo_url = c.logo_escuela ? `${c.logo_escuela}` : null;
        const rangoEdad = getRangoEdad(Number(c.edad));
        const rangoGraduacion = getRangoGraduacion(c.graduacion || "");
        const key = `${c.genero}-${rangoGraduacion}-${rangoEdad}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(c);
      });

      const brackets = [];

      // 3️⃣ Procesar cada grupo
      Object.entries(grupos).forEach(([grupo, competidoresGrupo]) => {
        if (competidoresGrupo.length === 1) {
          // 👤 Solo un competidor: grupo de exhibición o clasificación directa
          const competidor = competidoresGrupo[0];
          brackets.push({
            grupo,
            ronda: [],
            semis: [null, null],
            final: [null],
            modalidad: "forma",
            competidores: [competidor],
            dnis: [competidor.dni],
            nota: "Participante único"
          });
        } else {
          const MAX_PER_GROUP = 8; // En formas normalmente no más de 8 por grupo

          function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          }

          // 4️⃣ Subdividir grupos si hay más de MAX_PER_GROUP
          for (let i = 0; i < competidoresGrupo.length; i += MAX_PER_GROUP) {
            const subgrupo = competidoresGrupo.slice(i, i + MAX_PER_GROUP);
            const grupoKey = `${grupo}${competidoresGrupo.length > MAX_PER_GROUP ? `-${Math.floor(i / MAX_PER_GROUP) + 1}` : ""}`;
            const ordenExistente = ordenMap[grupoKey] || {};

            // Separar entre ya ordenados y nuevos
            const nuevosCompetidores = subgrupo.filter(c => !ordenExistente[c.dni]);
            const yaOrdenados = subgrupo.filter(c => ordenExistente[c.dni]);

            // 5️⃣ Asignar orden a nuevos competidores
            if (nuevosCompetidores.length > 0) {
              const startIndex = Math.max(0, ...Object.values(ordenExistente)) + 1;
              nuevosCompetidores.forEach((c, idx) => {
                const ordenFinal = startIndex + idx;
                db.run(
                  "INSERT OR IGNORE INTO bracket_orden (grupo, dni, orden) VALUES (?, ?, ?)",
                  [grupoKey, c.dni, ordenFinal]
                );
              });
            }

            // 6️⃣ Reconstruir orden final
            const ordenCombinado = [...yaOrdenados, ...nuevosCompetidores].sort((a, b) => {
              const oa = ordenExistente[a.dni] ?? 9999;
              const ob = ordenExistente[b.dni] ?? 9999;
              return oa - ob;
            });

            // 7️⃣ Crear estructura de ronda
            const ronda = [];
            for (let j = 0; j < ordenCombinado.length; j += 2) {
              ronda.push({
                a: ordenCombinado[j]?.nombre || null,
                b: ordenCombinado[j + 1]?.nombre || null
              });
            }

            // 8️⃣ Agregar estructura del bracket
            brackets.push({
              grupo: grupoKey,
              ronda,
              semis: [null, null],
              final: [null],
              modalidad: "forma",
              competidores: ordenCombinado,
              dnis: ordenCombinado.map(c => c.dni)
            });
          }
        }
      });

      // 9️⃣ Integrar resultados previos (si existen)
      db.all("SELECT * FROM llaves", [], (err2, rowsLlaves) => {
        if (err2) return res.status(500).send(err2);

        brackets.forEach(estructura => {
          rowsLlaves.forEach(({ grupo, etapa, ganador, modalidad }) => {
            if (modalidad === "forma" && estructura.grupo === grupo) {
              if (etapa === "semis1") estructura.semis[0] = ganador;
              if (etapa === "semis2") estructura.semis[1] = ganador;
              if (etapa === "final") estructura.final[0] = ganador;
            }
          });
        });

        // ✅ Responder con brackets generados
        res.json({ brackets });
      });
    });
  });
});
};