// utils/verificarDni.js
const db = require("../database");

// Función que devuelve conflictos de DNI en todas las escuelas
function verificarDniGlobal(dni, escuelaActual = null) {
  return new Promise((resolve, reject) => {
    db.all("SELECT nombre, instructores FROM escuelas", [], (err, escuelas) => {
      if (err) return reject(err);

      const dniNormalizado = dni.trim();
      const escuelasConDni = [];

      escuelas.forEach(escuela => {
        try {
          const instructores = JSON.parse(escuela.instructores || "[]");
          instructores.forEach(instructor => {
            if (instructor.dni && instructor.dni.trim() === dniNormalizado) {
              if (escuelaActual === null || escuela.nombre !== escuelaActual) {
                escuelasConDni.push({
                  escuela: escuela.nombre,
                  instructor: instructor.nombre
                });
              }
            }
          });
        } catch (e) {
          console.error("Error parseando instructores de escuela:", escuela.nombre, e);
        }
      });

      resolve(escuelasConDni);
    });
  });
}

module.exports = { verificarDniGlobal };
