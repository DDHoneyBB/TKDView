// routes/validarIngreso.js
const express = require("express");
const router = express.Router();
const db = require("../database"); // tu base de datos SQLite o LowDB

// Función para buscar instructores dentro de escuelas
function buscarInstructorPorDni(dni, callback) {
  db.all("SELECT nombre, instructores FROM escuelas", [], (err, escuelas) => {
    if (err) return callback(err);

    const dniNormalizado = dni.trim();
    for (const escuela of escuelas) {
      try {
        const instructores = JSON.parse(escuela.instructores || "[]");
        for (const instructor of instructores) {
          if (instructor.dni && instructor.dni.trim() === dniNormalizado) {
            return callback(null, {
              autorizado: true,
              nombre: instructor.nombre,
              rol: "Instructor",
            });
          }
        }
      } catch (e) {
        console.error("Error parseando instructores en escuela:", escuela.nombre, e);
      }
    }

    callback(null, null); // No se encontró
  });
}

// --- VALIDAR USUARIO ---
router.get("/usuarios/validar", (req, res) => {
  const { dni } = req.query;
  if (!dni) return res.status(400).json({ autorizado: false, mensaje: "DNI no proporcionado" });
  const dniNormalizado = dni.trim();

  // Revisar competidores
  db.get("SELECT nombre, rol, ingreso FROM competidores WHERE dni = ?", [dniNormalizado], (err, usuario) => {
    if (err) return res.status(500).json({ autorizado: false, mensaje: "Error interno" });

    if (usuario) {
      if (usuario.ingreso === 1) {
        return res.json({ autorizado: false, mensaje: "Usuario ya ingresó", nombre: usuario.nombre, rol: usuario.rol });
      }
      // Marcar ingreso
      db.run("UPDATE competidores SET ingreso = 1 WHERE dni = ?", [dniNormalizado]);
      // Registrar en tabla de ingresos si existe
      db.run("INSERT INTO ingresos (dni, nombre, rol) VALUES (?, ?, ?)", [dniNormalizado, usuario.nombre, usuario.rol]);
      return res.json({ autorizado: true, nombre: usuario.nombre, rol: usuario.rol });
    }

    // Revisar coaches
    db.get("SELECT nombre, dni FROM coaches WHERE dni = ?", [dniNormalizado], (err, coach) => {
      if (err) return res.status(500).json({ autorizado: false, mensaje: "Error interno" });
      if (coach) {
        db.run("INSERT INTO ingresos (dni, nombre, rol) VALUES (?, ?, ?)", [dniNormalizado, coach.nombre, "Coach"]);
        return res.json({ autorizado: true, nombre: coach.nombre, rol: "Coach" });
      }

      // Revisar espectadores
      db.get("SELECT nombre, checkedIn FROM espectadores WHERE dni = ?", [dniNormalizado], (err, espectador) => {
        if (err) return res.status(500).json({ autorizado: false, mensaje: "Error interno" });
        if (espectador) {
          if (espectador.checkedIn === 1) {
            return res.json({ autorizado: false, mensaje: "Usuario ya ingresó", nombre: espectador.nombre, rol: "Invitado" });
          }
          // Marcar ingreso
          db.run("UPDATE espectadores SET checkedIn = 1 WHERE dni = ?", [dniNormalizado]);
          db.run("INSERT INTO ingresos (dni, nombre, rol) VALUES (?, ?, ?)", [dniNormalizado, espectador.nombre, "Invitado"]);
          return res.json({ autorizado: true, nombre: espectador.nombre, rol: "Invitado" });
        }

        // Revisar instructores dentro de escuelas
        buscarInstructorPorDni(dniNormalizado, (err, instructor) => {
          if (err) return res.status(500).json({ autorizado: false, mensaje: "Error interno" });
          if (instructor) {
            db.run("INSERT INTO ingresos (dni, nombre, rol) VALUES (?, ?, ?)", [dniNormalizado, instructor.nombre, instructor.rol]);
            return res.json(instructor);
          }

          // No se encontró
          return res.json({ autorizado: false, mensaje: "Usuario no encontrado" });
        });
      });
    });
  });
});

// --- REGISTRAR INGRESO (con nombre y hora) ---
router.post("/usuarios/registrar", (req, res) => {
  const { dni, nombre } = req.body;
  if (!dni || !nombre) return res.status(400).json({ mensaje: "Falta DNI o nombre" });

  const hora = new Date().toLocaleTimeString();
  db.get("ingresos").push({ dni, nombre, hora }).write();

  res.json({ ok: true, mensaje: "Ingreso registrado", dni, nombre, hora });
});

// --- LISTAR TODOS LOS INGRESOS REGISTRADOS (versión con tabla ingresos) ---
router.get("/usuarios/ingresados", (req, res) => {
  db.all(
    "SELECT dni, nombre, rol, horaIngreso FROM ingresos ORDER BY horaIngreso DESC",
    [],
    (err, ingresos) => {
      if (err) {
        console.error("Error obteniendo ingresos:", err);
        return res.status(500).json({ error: "Error al cargar ingresos" });
      }
      res.json({ ingresos: ingresos || [] });
    }
  );
});

// Función para obtener instructores que han ingresado
function obtenerInstructoresIngresados(callback) {
  // Necesitarías una tabla separada para trackear ingresos de instructores
  // Por ahora, asumimos que todos los instructores pueden ingresar
  db.all("SELECT nombre, instructores FROM escuelas", [], (err, escuelas) => {
    if (err) return callback(err);

    const instructoresIngresados = [];
    for (const escuela of escuelas) {
      try {
        const instructores = JSON.parse(escuela.instructores || "[]");
        for (const instructor of instructores) {
          if (instructor.dni && instructor.nombre) {
            instructoresIngresados.push({
              dni: instructor.dni.trim(),
              nombre: instructor.nombre,
              rol: "Instructor",
              tipo: "Instructor"
            });
          }
        }
      } catch (e) {
        console.error("Error parseando instructores:", e);
      }
    }
    callback(null, instructoresIngresados);
  });
}

module.exports = router;