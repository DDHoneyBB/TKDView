// utils/databaseSetup.js

function setupDatabase(db) {

  // Función para crear tabla
  const crearTabla = (nombre, sql) => {
    return new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`❌ Error creando tabla ${nombre}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Tabla ${nombre} verificada o creada`);
          resolve();
        }
      });
    });
  };

  // Función para agregar columna 'estado' si no existe
  const agregarColumnaEstado = () => {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(competidores)`, (err, rows) => {
        if (err) return reject(err);

        const existeEstado = rows.some(c => c.name === "estado");
        if (!existeEstado) {
          console.log("➡️ Agregando columna 'estado' a competidores...");
          db.run(
            `ALTER TABLE competidores ADD COLUMN estado TEXT DEFAULT 'pendiente';`,
            (err2) => {
              if (err2) console.error("❌ Error al agregar columna 'estado':", err2.message);
              else console.log("✔️ Columna 'estado' agregada.");
              resolve();
            }
          );
        } else {
          console.log("✔️ Columna 'estado' ya existe, no se agrega");
          resolve();
        }
      });
    });
  };

  // Secuencia de creación de tablas
  return crearTabla("competidores", `
    CREATE TABLE IF NOT EXISTS competidores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      dni TEXT,
      edad INTEGER,
      genero TEXT,
      altura INTEGER,
      peso REAL,
      escuela TEXT,
      rol TEXT,
      graduacion TEXT,
      categoria TEXT,
      instructor TEXT,
      modalidad TEXT,
      logoEscuela TEXT,
      fotoPerfil TEXT,
      dorsal TEXT,
      grupo TEXT,
      ingreso INTEGER DEFAULT 0,
      UNIQUE(dni, modalidad)
    )
  `)
    .then(agregarColumnaEstado)
    .then(() => crearTabla("coaches", `
      CREATE TABLE IF NOT EXISTS coaches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        dni TEXT UNIQUE,
        edad INTEGER,
        escuela TEXT,
        instructor TEXT,
        fotoPerfil TEXT,
        fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
        fotoEliminada BOOLEAN DEFAULT 0
      )
    `))
    .then(() => crearTabla("espectadores", `
      CREATE TABLE IF NOT EXISTS espectadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        dni TEXT UNIQUE,
        checkedIn INTEGER DEFAULT 0
      )
    `))
    .then(() => crearTabla("ingresos", `
      CREATE TABLE IF NOT EXISTS ingresos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dni TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT NOT NULL,
        horaIngreso DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `))
    .then(() => crearTabla("puntajes", `
      CREATE TABLE IF NOT EXISTS puntajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        juez TEXT,
        competidor TEXT,
        tatami_id INTEGER,
        puntos INTEGER,
        tipo TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `))
    .then(() => crearTabla("tatamis", `
      CREATE TABLE IF NOT EXISTS tatamis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER UNIQUE,
        nombre TEXT,
        categoria_actual TEXT,
        modalidad_actual TEXT,
        estado TEXT DEFAULT 'activo',
        ubicacion TEXT
      )
    `))
    .then(() => crearTabla("combates_tatami", `
      CREATE TABLE IF NOT EXISTS combates_tatami (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tatami_id INTEGER,
        combate_grupo TEXT,
        competidor_rojo_id INTEGER,
        competidor_azul_id INTEGER,
        orden INTEGER DEFAULT 0,
        estado TEXT DEFAULT 'pendiente',
        puntos_rojo INTEGER DEFAULT 0,
        puntos_azul INTEGER DEFAULT 0,
        ganador_id INTEGER,
        round_actual INTEGER DEFAULT 1,
        tiempo_restante TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_inicio DATETIME,
        fecha_fin DATETIME,
        FOREIGN KEY (tatami_id) REFERENCES tatamis (id)
      )
    `))
    .then(() => crearTabla("escuelas", `
      CREATE TABLE IF NOT EXISTS escuelas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE,
        logo TEXT,
        instructores TEXT,
        coachs TEXT
      )
    `))
    .then(() => crearTabla("registros_recibir", `
      CREATE TABLE IF NOT EXISTS registros_recibir (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT,
        juez TEXT,
        competidor TEXT,
        valor TEXT,
        id_tatami INTEGER
      )
    `))
    .then(() => crearTabla("bracket_rondas", `
      CREATE TABLE IF NOT EXISTS bracket_rondas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modalidad TEXT,
        grupo TEXT,
        ronda TEXT,
        competidor1 TEXT,
        competidor2 TEXT,
        ganador TEXT
      )
    `))
    .then(() => crearTabla("bracket_orden", `
      CREATE TABLE IF NOT EXISTS bracket_orden (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grupo TEXT NOT NULL,
        dni TEXT NOT NULL,
        orden INTEGER
      )
    `))
    .then(() => crearTabla("llaves", `
      CREATE TABLE IF NOT EXISTS llaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modalidad TEXT NOT NULL,
        grupo TEXT NOT NULL,
        etapa TEXT,
        ganador TEXT
      )
    `))
    .then(() => crearTabla("exhibiciones", `
      CREATE TABLE IF NOT EXISTS exhibiciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        competidor_id INTEGER,
        rival_id INTEGER,
        grupo TEXT
      )
    `))
    .then(() => console.log("✔️ Setup de base de datos completo"))
    .catch(err => console.error("❌ Error en setupDatabase:", err.message));
}

module.exports = setupDatabase;
