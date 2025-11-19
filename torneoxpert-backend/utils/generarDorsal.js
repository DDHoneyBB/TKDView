const db = require("../database");

const generarDorsal = async (dni, categoria) => {
  return new Promise((resolve, reject) => {
    const verificarSql = `SELECT dorsal FROM competidores WHERE dni = ? LIMIT 1`;

    db.get(verificarSql, [dni], (err, row) => {
      if (err) return reject(err);

      if (row && row.dorsal) return resolve(row.dorsal);

      let prefijo;
      switch (categoria) {
        case "Infantil": prefijo = "I"; break;
        case "Juvenil": prefijo = "J"; break;
        case "Adultos": prefijo = "A"; break;
        case "Veteranos": prefijo = "V"; break;
        default: prefijo = "X"; break;
      }

      const ultimoSql = `SELECT MAX(CAST(SUBSTR(dorsal,2) AS INTEGER)) as ultimo FROM competidores`;

      db.get(ultimoSql, [], (err, row) => {
        if (err) return reject(err);

        const ultimoNum = row && row.ultimo != null ? row.ultimo : -1;
        const dorsal = `${prefijo}${String(ultimoNum + 1).padStart(3, "0")}`;
        resolve(dorsal);
      });
    });
  });
};

module.exports = generarDorsal;
