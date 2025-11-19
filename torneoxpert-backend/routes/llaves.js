// routes/llaves.js
module.exports = (app, db) => {
  // ==================== LLAVES Y GANADORES ====================
// ==================== NUEVA RUTA PARA DEVOLVER LOS BRACKETS ====================
app.get("/api/brackets", (req, res) => {
  const modalidad = req.query.modalidad || 'combate'; // por defecto 'combate'

  db.all(
    "SELECT * FROM llaves WHERE modalidad = ? ORDER BY grupo, etapa",
    [modalidad],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener los brackets:", err);
        return res.status(500).json({ error: "Error al obtener los brackets" });
      }

      // Reorganizamos los datos en un formato estructurado
      const bracketsPorGrupo = {};
      rows.forEach((row) => {
        if (!bracketsPorGrupo[row.grupo]) {
          bracketsPorGrupo[row.grupo] = { grupo: row.grupo, modalidad: row.modalidad, etapas: {} };
        }
        bracketsPorGrupo[row.grupo].etapas[row.etapa] = row.ganador;
      });

      res.json(Object.values(bracketsPorGrupo)); // enviamos como array de grupos
    }
  );
});

app.get("/api/brackets-forma", (req, res) => {
  db.all(
    "SELECT * FROM llaves WHERE modalidad = 'forma' ORDER BY grupo, etapa",
    [],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener los brackets de forma:", err);
        return res.status(500).json({ error: "Error al obtener brackets de forma" });
      }

      const bracketsPorGrupo = {};
      rows.forEach((row) => {
        if (!bracketsPorGrupo[row.grupo]) {
          bracketsPorGrupo[row.grupo] = { grupo: row.grupo, modalidad: row.modalidad, etapas: {} };
        }
        bracketsPorGrupo[row.grupo].etapas[row.etapa] = row.ganador;
      });

      res.json(Object.values(bracketsPorGrupo));
    }
  );
});
  // Registrar ganador
app.post("/api/ganador", (req, res) => {
  const { grupo, etapa, ganador, modalidad } = req.body;
  console.log("Recibiendo ganador:", grupo, etapa, ganador, modalidad);
  db.run(
  "INSERT OR REPLACE INTO llaves (modalidad, grupo, etapa, ganador) VALUES (?, ?, ?, ?)",
  [modalidad, grupo, etapa, ganador],
  (err) => {
    if (err) {
      console.error("Error al insertar ganador:", err.message);
      return res.status(500).send(err.message);
    }
    res.sendStatus(200);
  }
);
});
{/*Estados para ganadores en tatami */}
app.get("/api/estado-ganadores", (req, res) => {
  db.all("SELECT * FROM llaves ORDER BY rowid DESC", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    
    const ganadoresPorGrupo = {};
    rows.forEach(row => {
      if (!ganadoresPorGrupo[row.grupo]) ganadoresPorGrupo[row.grupo] = {};
      ganadoresPorGrupo[row.grupo][row.etapa] = {
        nombre: row.ganador,
        modalidad: row.modalidad,
        timestamp: row.rowid // Usamos rowid como referencia temporal
      };
    });
    
    res.json(ganadoresPorGrupo);
  });
});

app.get("/api/ganadores-completos", (req, res) => {
  db.all(`
    SELECT l.*, c.dni, c.fotoPerfil, c.escuela, c.graduacion 
    FROM llaves l 
    LEFT JOIN competidores c ON l.ganador = c.nombre 
    ORDER BY l.rowid DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Eliminar ganador
app.delete("/api/ganador", (req, res) => {
  const { grupo, etapa } = req.query;

  if (!grupo || !etapa) {
    return res.status(400).json({ message: "Faltan parámetros 'grupo' o 'etapa'" });
  }

  // Validar etapa
  const etapasValidas = ["octavos1","octavos2","octavos3","octavos4","octavos5","octavos6","octavos7","octavos8",
                         "cuartos1","cuartos2","cuartos3","cuartos4",
                         "semis1","semis2","semis3","semis4",
                         "final1","final2"];
  if (!etapasValidas.includes(etapa)) {
    return res.status(400).json({ message: `Etapa inválida: ${etapa}` });
  }

  console.log(`Eliminando ganador - Grupo: ${grupo}, Etapa: ${etapa}`);

  db.run(
    "DELETE FROM llaves WHERE grupo = ? AND etapa = ?",
    [grupo, etapa],
    function(err) {
      if (err) {
        console.error("Error al eliminar ganador:", err);
        return res.status(500).send(err);
      }
      console.log(`Ganador eliminado correctamente: grupo=${grupo}, etapa=${etapa}`);
      res.sendStatus(200);
    }
  );
});
// Actualizar Brackets

app.post('/api/actualizar-brackets', (req, res) => {
  const nuevosBrackets = req.body.brackets;
  
  if (!nuevosBrackets) {
    return res.status(400).json({ error: "Datos de brackets no proporcionados" });
  }

  db.serialize(() => {
    db.run("DELETE FROM llaves WHERE modalidad = ?", [nuevosBrackets.modalidad || 'combate'], (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al limpiar brackets anteriores" });
      }

      const stmt = db.prepare("INSERT INTO llaves (modalidad, grupo, etapa, ganador) VALUES (?, ?, ?, ?)");
      
      try {
        nuevosBrackets.forEach(bracket => {
          if (bracket.semis && bracket.semis[0]) {
            stmt.run(bracket.modalidad, bracket.grupo, 'semis1', bracket.semis[0]);
          }
          if (bracket.semis && bracket.semis[1]) {
            stmt.run(bracket.modalidad, bracket.grupo, 'semis2', bracket.semis[1]);
          }
          if (bracket.final) {
            stmt.run(bracket.modalidad, bracket.grupo, 'final', bracket.final);
          }
        });

        stmt.finalize();
        res.json({ success: true, message: "Brackets actualizados correctamente" });
      } catch (error) {
        res.status(500).json({ error: "Error al actualizar brackets", details: error.message });
      }
    });
  });
});

};




