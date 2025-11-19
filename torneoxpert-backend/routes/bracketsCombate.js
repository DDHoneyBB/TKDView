
const { getRangoEdad, getRangoPeso, getRangoGraduacion, buscarRivalExhibicion } = require("../utils/rangos");

// Edad:
const rangoEdad = getRangoEdad(16);

module.exports = (app, db) => {
  app.get("/api/brackets", (req, res) => {
  console.log("📊 Cargando brackets de combate...");

  const sql = `
    SELECT c.*, e.logo AS logo_escuela
    FROM competidores c
    LEFT JOIN escuelas e ON c.escuela = e.nombre
    WHERE (c.modalidad = 'combate' OR c.modalidad = 'ambos')
AND c.estado = 'aprobado'
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).send(err);

    // Cargar orden guardado
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
        const rangoPeso = getRangoPeso(Number(c.peso), c.genero, rangoEdad);
        const key = `${c.genero}-${rangoGraduacion}-${rangoEdad}-${rangoPeso}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(c);
      });

      const brackets = [];
      const exhibiciones = [];

      Object.entries(grupos).forEach(([grupo, competidoresGrupo]) => {
        const MAX_PER_GROUP = 16;

        // Si hay orden guardado, usarlo
        const ordenGuardado = ordenMap[grupo];
        if (ordenGuardado) {
          competidoresGrupo.sort((a, b) => (ordenGuardado[a.dni] ?? 9999) - (ordenGuardado[b.dni] ?? 9999));
        }

        if (competidoresGrupo.length === 1) {
          const competidor = competidoresGrupo[0];
          const rival = buscarRivalExhibicion(competidor, rows);
          exhibiciones.push({
            exhibicion: true,
            grupo,
            competidor,
            rivalSugerido: rival
          });
        } else {
          // Cortar en subgrupos de hasta 16
          for (let i = 0; i < competidoresGrupo.length; i += MAX_PER_GROUP) {
            const subgrupo = competidoresGrupo.slice(i, i + MAX_PER_GROUP);
            const ordered = subgrupo;
            const pairs = [];
            for (let j = 0; j < ordered.length; j += 2) {
              pairs.push({ a: ordered[j]?.nombre || null, b: ordered[j + 1]?.nombre || null });
            }

            const ronda = pairs.map(p => ({ a: p.a, b: p.b }));

            const octavos = Array(8).fill(null);
            const cuartos = Array(4).fill(null);
            const semis = Array(2).fill(null);
            const final = [null];

            brackets.push({
              grupo: `${grupo}${competidoresGrupo.length > MAX_PER_GROUP ? `-${Math.floor(i / MAX_PER_GROUP) + 1}` : ""}`,
              ronda,
              octavos,
              cuartos,
              semis,
              final,
              modalidad: "combate",
              competidores: ordered,
              dnis: ordered.map(c => c.dni)
            });
          }
        }
      });

      // Cargar exhibiciones y llaves
      db.all("SELECT * FROM exhibiciones", [], (err3, exhibs) => {
        if (err3) return res.status(500).send(err3);

        exhibs.forEach(ex => {
          const competidor = rows.find(c => c.id === ex.competidor_id);
          const rival = rows.find(c => c.id === ex.rival_id);
          if (competidor && rival) {
            brackets.push({
              grupo: `Exhibición-${ex.grupo}-${competidor.nombre}-vs-${rival.nombre}`,
              ronda: [{ a: competidor.nombre, b: rival.nombre }],
              octavos: [null, null, null, null, null, null, null, null],
              cuartos: [null, null, null, null],
              semis: [null, null],
              final: [null],
              competidores: [competidor, rival],
              dnis: [competidor.dni, rival.dni],
              exhibicion: true
            });
          }
        });

        db.all("SELECT * FROM llaves", [], (err2, rowsLlaves) => {
          if (err2) return res.status(500).send(err2);

          brackets.forEach(estructura => {
            rowsLlaves.forEach(({ grupo, etapa, ganador }) => {
              if (estructura.grupo === grupo) {
                const idx = parseInt(etapa.replace(/\D/g, "")) - 1;
                if (etapa.startsWith("octavos")) estructura.octavos[idx] = ganador;
                if (etapa.startsWith("cuartos")) estructura.cuartos[idx] = ganador;
                if (etapa.startsWith("semis")) estructura.semis[idx] = ganador;
                if (etapa.startsWith("final")) estructura.final[idx] = ganador;
              }
            });
          });

          res.json({ brackets, exhibiciones });
        });
      });
    });
  });
});


// ==================== GENERAR BRACKETS (mezcla + guardado) ====================

app.get("/api/generar-brackets", (req, res) => {
  console.log("🔀 Generando brackets aleatorios (respetando órdenes existentes)...");
  const sql = `
    SELECT c.*, e.logo AS logo_escuela
    FROM competidores c
    LEFT JOIN escuelas e ON c.escuela = e.nombre
    WHERE (c.modalidad = 'combate' OR c.modalidad = 'ambos')
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

      const grupos = {};
      rows.forEach(c => {
        c.logo_url = c.logo_escuela ? `${c.logo_escuela}` : null;
        const rangoEdad = getRangoEdad(Number(c.edad));
        const rangoGraduacion = getRangoGraduacion(c.graduacion || "");
        const rangoPeso = getRangoPeso(Number(c.peso), c.genero, rangoEdad);
        const key = `${c.genero}-${rangoGraduacion}-${rangoEdad}-${rangoPeso}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(c);
      });

      const brackets = [];
      const exhibiciones = [];

      Object.entries(grupos).forEach(([grupo, competidoresGrupo]) => {
        if (competidoresGrupo.length === 1) {
          const competidor = competidoresGrupo[0];
          const rival = buscarRivalExhibicion(competidor, rows);
          exhibiciones.push({
            exhibicion: true,
            grupo,
            competidor,
            rivalSugerido: rival
          });
        } else {
          const MAX_PER_GROUP = 16;

          function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          }

          function createPairsAvoidingSameInstructor(list) {
            const MAX_TRIES = 20;
            for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
              const arr = shuffleArray([...list]);
              const pairs = [];
              let ok = true;
              for (let i = 0; i < arr.length; i += 2) {
                const A = arr[i];
                const B = arr[i + 1] || null;
                if (B && A.instructor && B.instructor && A.instructor === B.instructor) {
                  ok = false;
                  break;
                }
                pairs.push({ a: A?.nombre || null, b: B?.nombre || null });
              }
              if (ok) return { pairs, ordered: arr };
            }
            const arr2 = shuffleArray([...list]);
            const fallback = [];
            for (let i = 0; i < arr2.length; i += 2) {
              fallback.push({ a: arr2[i]?.nombre || null, b: arr2[i + 1]?.nombre || null });
            }
            return { pairs: fallback, ordered: arr2 };
          }

          for (let i = 0; i < competidoresGrupo.length; i += MAX_PER_GROUP) {
            const subgrupo = competidoresGrupo.slice(i, i + MAX_PER_GROUP);
            const { pairs, ordered } = createPairsAvoidingSameInstructor(subgrupo);

            const grupoKey = `${grupo}${competidoresGrupo.length > MAX_PER_GROUP ? `-${Math.floor(i / MAX_PER_GROUP) + 1}` : ""}`;
            const ordenExistente = ordenMap[grupoKey] || {};

            // 2️⃣ Mantener los competidores que ya tienen orden
            const nuevosCompetidores = ordered.filter(c => !ordenExistente[c.dni]);
            const yaOrdenados = ordered.filter(c => ordenExistente[c.dni]);

            // Si todos ya tienen orden, no reordenar ni guardar nada
            if (nuevosCompetidores.length === 0) {
              console.log(`⚠️ Grupo ${grupoKey}: ya tiene todos los competidores con orden, se omite`);
            } else {
              // 3️⃣ Asignar orden solo a los nuevos
              const startIndex = Math.max(...Object.values(ordenExistente)) + 1 || 0;
              nuevosCompetidores.forEach((c, idx) => {
                const ordenFinal = startIndex + idx;
                db.run(
                  "INSERT OR IGNORE INTO bracket_orden (grupo, dni, orden) VALUES (?, ?, ?)",
                  [grupoKey, c.dni, ordenFinal]
                );
              });
            }

            // 4️⃣ Reconstruir orden final combinando ambos
            const ordenCombinado = [...yaOrdenados, ...nuevosCompetidores].sort((a, b) => {
              const oa = ordenExistente[a.dni] ?? 9999;
              const ob = ordenExistente[b.dni] ?? 9999;
              return oa - ob;
            });

            const ronda = [];
            for (let j = 0; j < ordenCombinado.length; j += 2) {
              ronda.push({ a: ordenCombinado[j]?.nombre || null, b: ordenCombinado[j + 1]?.nombre || null });
            }

            const octavos = Array(8).fill(null);
            const cuartos = Array(4).fill(null);
            const semis = Array(2).fill(null);
            const final = [null];

            brackets.push({
              grupo: grupoKey,
              ronda,
              octavos,
              cuartos,
              semis,
              final,
              modalidad: "combate",
              competidores: ordenCombinado,
              dnis: ordenCombinado.map(c => c.dni)
            });
          }
        }
      });

      db.all("SELECT * FROM exhibiciones", [], (err3, exhibs) => {
        if (err3) return res.status(500).send(err3);

        exhibs.forEach(ex => {
          const competidor = rows.find(c => c.id === ex.competidor_id);
          const rival = rows.find(c => c.id === ex.rival_id);
          if (competidor && rival) {
            brackets.push({
              grupo: `Exhibición-${ex.grupo}-${competidor.nombre}-vs-${rival.nombre}`,
              ronda: [{ a: competidor.nombre, b: rival.nombre }],
              octavos: [null, null, null, null, null, null, null, null],
              cuartos: [null, null, null, null],
              semis: [null, null],
              final: [null],
              competidores: [competidor, rival],
              dnis: [competidor.dni, rival.dni],
              exhibicion: true
            });
          }
        });

        res.json({ brackets, exhibiciones });
      });
    });
  });
});


app.get("/api/regenerar-brackets", (req, res) => {
  console.log("🔁 Regenerando brackets...");

  // 🔹 1️⃣ Eliminar todos los ganadores guardados
  db.run("DELETE FROM llaves", (errLlaves) => {
    if (errLlaves) return res.status(500).send("Error al limpiar tabla 'llaves'");

    console.log("🧹 Tabla 'llaves' limpiada correctamente.");

    // 🔹 2️⃣ Eliminar todos los órdenes guardados
    db.run("DELETE FROM bracket_orden", (errDel) => {
      if (errDel) return res.status(500).send("Error al limpiar 'bracket_orden'");

      console.log("🧹 Tabla 'bracket_orden' limpiada.");

      const sql = `
        SELECT c.*, e.logo AS logo_escuela
        FROM competidores c
        LEFT JOIN escuelas e ON c.escuela = e.nombre
        WHERE (c.modalidad = 'combate' OR c.modalidad = 'ambos')
AND c.estado = 'aprobado'

      `;

      db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send(err);

        const grupos = {};
        rows.forEach(c => {
          c.logo_url = c.logo_escuela ? `${c.logo_escuela}` : null;
          const rangoEdad = getRangoEdad(Number(c.edad));
          const rangoGraduacion = getRangoGraduacion(c.graduacion || "");
          const rangoPeso = getRangoPeso(Number(c.peso), c.genero, rangoEdad);
          const key = `${c.genero}-${rangoGraduacion}-${rangoEdad}-${rangoPeso}`;
          if (!grupos[key]) grupos[key] = [];
          grupos[key].push(c);
        });

        const brackets = [];
        const exhibiciones = [];

        Object.entries(grupos).forEach(([grupo, competidoresGrupo]) => {
          if (competidoresGrupo.length === 1) {
            const competidor = competidoresGrupo[0];
            const rival = buscarRivalExhibicion(competidor, rows);
            exhibiciones.push({
              exhibicion: true,
              grupo,
              competidor,
              rivalSugerido: rival
            });
          } else {
            const MAX_PER_GROUP = 16;

            function shuffleArray(arr) {
              for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
              }
              return arr;
            }

            function createPairsAvoidingSameInstructor(list) {
              const MAX_TRIES = 20;
              for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
                const arr = shuffleArray([...list]);
                const pairs = [];
                let ok = true;
                for (let i = 0; i < arr.length; i += 2) {
                  const A = arr[i];
                  const B = arr[i + 1] || null;
                  if (B && A.instructor && B.instructor && A.instructor === B.instructor) {
                    ok = false;
                    break;
                  }
                  pairs.push({ a: A?.nombre || null, b: B?.nombre || null });
                }
                if (ok) return { pairs, ordered: arr };
              }
              const arr2 = shuffleArray([...list]);
              const fallback = [];
              for (let i = 0; i < arr2.length; i += 2) {
                fallback.push({ a: arr2[i]?.nombre || null, b: arr2[i + 1]?.nombre || null });
              }
              return { pairs: fallback, ordered: arr2 };
            }

            for (let i = 0; i < competidoresGrupo.length; i += MAX_PER_GROUP) {
              const subgrupo = competidoresGrupo.slice(i, i + MAX_PER_GROUP);
              const { pairs, ordered } = createPairsAvoidingSameInstructor(subgrupo);

              const grupoKey = `${grupo}${competidoresGrupo.length > MAX_PER_GROUP ? `-${Math.floor(i / MAX_PER_GROUP) + 1}` : ""}`;

              // 🔹 3️⃣ Insertar nuevos órdenes desde cero
              ordered.forEach((c, idx) => {
                db.run(
                  "INSERT INTO bracket_orden (grupo, dni, orden) VALUES (?, ?, ?)",
                  [grupoKey, c.dni, idx]
                );
              });

              // 🔹 4️⃣ Construir ronda inicial
              const ronda = [];
              for (let j = 0; j < ordered.length; j += 2) {
                ronda.push({ a: ordered[j]?.nombre || null, b: ordered[j + 1]?.nombre || null });
              }

              const octavos = Array(8).fill(null);
              const cuartos = Array(4).fill(null);
              const semis = Array(2).fill(null);
              const final = [null];

              brackets.push({
                grupo: grupoKey,
                ronda,
                octavos,
                cuartos,
                semis,
                final,
                modalidad: "combate",
                competidores: ordered,
                dnis: ordered.map(c => c.dni)
              });
            }
          }
        });

        db.all("SELECT * FROM exhibiciones", [], (err3, exhibs) => {
          if (err3) return res.status(500).send(err3);

          exhibs.forEach(ex => {
            const competidor = rows.find(c => c.id === ex.competidor_id);
            const rival = rows.find(c => c.id === ex.rival_id);
            if (competidor && rival) {
              brackets.push({
                grupo: `Exhibición-${ex.grupo}-${competidor.nombre}-vs-${rival.nombre}`,
                ronda: [{ a: competidor.nombre, b: rival.nombre }],
                octavos: Array(8).fill(null),
                cuartos: Array(4).fill(null),
                semis: Array(2).fill(null),
                final: [null],
                competidores: [competidor, rival],
                dnis: [competidor.dni, rival.dni],
                exhibicion: true
              });
            }
          });

          res.json({ brackets, exhibiciones });
        });
      });
    });
  });
});
};