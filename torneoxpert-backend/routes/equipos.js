const fs = require("fs");

module.exports = (app) => {
  // ✅ Obtener todos los equipos inscritos (para organizadores)
  app.get("/equipos-formas", (req, res) => {
    const archivoEquipos = path.join(__dirname, "../equipos_formas.json");
    if (!fs.existsSync(archivoEquipos)) return res.json([]);

    try {
      const data = fs.readFileSync(archivoEquipos, "utf-8");
      const equipos = JSON.parse(data);
      res.json(equipos);
    } catch (error) {
      console.error("Error leyendo equipos:", error);
      res.status(500).json({ error: "Error al leer equipos" });
    }
  });
};
