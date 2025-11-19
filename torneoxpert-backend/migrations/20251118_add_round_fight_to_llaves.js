const sqlite3 = require("sqlite3").verbose();
module.exports = (app, db) => {
function parseEtapa(etapa) {
  if (!etapa) return { round: null, fight: null };
  const m = etapa.match(/([a-zA-Z]+)(\d*)/);
  if (!m) return { round: null, fight: null };
  const name = m[1].toLowerCase();
  const num = parseInt(m[2] || "1", 10) - 1;
  switch (name) {
    case "octavos": return { round: 0, fight: num };
    case "cuartos": return { round: 1, fight: num };
    case "semis": return { round: 2, fight: num };
    case "final": return { round: 3, fight: num };
    case "campeon": return { round: 4, fight: 0 };
    default: return { round: null, fight: null };
  }
}

db.serialize(() => {
  console.log("🔧 Migración: agregando columnas 'round' y 'fight' (si no existen)");
  db.run("ALTER TABLE llaves ADD COLUMN round INTEGER", [], (err) => {
    if (err && !/duplicate column/i.test(err.message)) console.error(err);
    else console.log("→ columna 'round' OK (o ya existía)");
  });
  db.run("ALTER TABLE llaves ADD COLUMN fight INTEGER", [], (err) => {
    if (err && !/duplicate column/i.test(err.message)) console.error(err);
    else console.log("→ columna 'fight' OK (o ya existía)");
  });

  db.all("SELECT id, etapa FROM llaves", [], (err, rows) => {
    if (err) return console.error(err);
    const stmt = db.prepare("UPDATE llaves SET round = ?, fight = ? WHERE rowid = ?");
    rows.forEach(r => {
      const { round, fight } = parseEtapa(r.etapa);
      stmt.run(round, fight, r.rowid);
    });
    stmt.finalize(() => {
      console.log("✅ Migración finalizada: valores 'round'/'fight' rellenados desde 'etapa' cuando fue posible.");
      db.close();
    });
  });
});
};