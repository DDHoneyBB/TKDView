// routes/exportarDB.js
const ExcelJS = require("exceljs");
const fs = require("fs");

module.exports = (app, db) => {
  app.post("/exportar-db", async (req, res) => {
    try {
      const filtros = req.body || {};
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sistema Tatami";
      workbook.created = new Date();

      const tablas = [
        "competidores",
        "escuelas",
        "tatamis",
        "combates_tatami",
        "llaves",
        "exhibiciones",
        "registros_recibir",
      ];

      for (const tabla of tablas) {
        const hoja = workbook.addWorksheet(
          tabla.charAt(0).toUpperCase() + tabla.slice(1)
        );

        let sql = `SELECT * FROM ${tabla}`;
        const condiciones = [];
        const valores = [];

        if (tabla === "competidores") {
          const { rol, modalidad, graduacion, genero, escuela } = filtros;

          if (rol && rol.trim() !== "") {
            condiciones.push("LOWER(rol) = ?");
            valores.push(rol.toLowerCase());
          }
          if (modalidad && modalidad.trim() !== "") {
            condiciones.push("LOWER(modalidad) = ?");
            valores.push(modalidad.toLowerCase());
          }
          if (graduacion && graduacion.trim() !== "") {
            condiciones.push("LOWER(graduacion) LIKE ?");
            valores.push(`%${graduacion.toLowerCase()}%`);
          }
          if (genero && genero.trim() !== "") {
            condiciones.push("LOWER(genero) = ?");
            valores.push(genero.toLowerCase());
          }
          if (escuela && escuela.trim() !== "") {
            condiciones.push("LOWER(escuela) LIKE ?");
            valores.push(`%${escuela.toLowerCase()}%`);
          }

          if (condiciones.length > 0) {
            sql += " WHERE " + condiciones.join(" AND ");
          }
        }

        await new Promise((resolve, reject) => {
          db.all(sql, valores, (err, rows) => {
            if (err) return reject(err);

            if (rows.length > 0) {
              hoja.columns = Object.keys(rows[0]).map((key) => ({
                header: key.toUpperCase(),
                key: key,
                width: 20,
              }));

              rows.forEach((row) => hoja.addRow(row));

              const headerRow = hoja.getRow(1);
              headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FF4F81BD" },
                };
                cell.alignment = { vertical: "middle", horizontal: "center" };
              });

              hoja.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: 1, column: hoja.columns.length },
              };
            } else {
              hoja.addRow(["(sin registros)"]);
            }

            resolve();
          });
        });
      }

      const nombreArchivo =
        filtros.nombreArchivo?.trim() || "Base_Tatami.xlsx";
      const ruta = path.join(__dirname, nombreArchivo);

      await workbook.xlsx.writeFile(ruta);

      res.download(ruta, nombreArchivo, (err) => {
        if (err) console.error("Error al enviar Excel:", err);
        fs.unlink(ruta, () => {}); // borrar temporal
      });
    } catch (error) {
      console.error("Error exportando DB:", error);
      res.status(500).json({ error: "Error al generar Excel" });
    }
  });
};
