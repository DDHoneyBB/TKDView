// routes/timer.js
module.exports = (app, db, tatamis) => {

  // Si no existe la estructura de tatamis, la creamos
  if (!tatamis) tatamis = {};

  // ✅ Ajustar timer central
  app.post("/ajustar-timer", (req, res) => {
    const { tatamiId, minutos } = req.body;

    if (!tatamiId || minutos === undefined) {
      return res.status(400).json({ error: "Falta tatamiId o minutos" });
    }

    // Crear el tatami si no existe
    if (!tatamis[tatamiId]) {
      tatamis[tatamiId] = { timerCentral: 0 };
    }

    // Guardamos en segundos (por compatibilidad con tus timers)
    tatamis[tatamiId].timerCentral = minutos * 60;

    console.log(`🕒 Timer del Tatami ${tatamiId} ajustado a ${minutos} minutos`);

    return res.json({
      success: true,
      tatamiId,
      timer: tatamis[tatamiId].timerCentral,
      minutos,
    });
  });

  // Modificar el backend para manejar cuenta regresiva
  app.post("/iniciar-timer", (req, res) => {
    const { tatamiId, minutos } = req.body;
    
    if (!tatamis[tatamiId]) tatamis[tatamiId] = {};
    
    // Configurar timer y iniciar cuenta regresiva
    tatamis[tatamiId].timerCentral = minutos * 60;
    tatamis[tatamiId].timerActivo = true;
    
    // Intervalo que decrementa cada segundo
    const intervalo = setInterval(() => {
      if (tatamis[tatamiId].timerCentral > 0 && tatamis[tatamiId].timerActivo) {
        tatamis[tatamiId].timerCentral--;
      } else {
        clearInterval(intervalo);
      }
    }, 1000);
    
    res.json({ success: true });
  });

  // ✅ Obtener timer central actual
  app.get("/tiempo-central", (req, res) => {
    const tatamiId = req.query.tatami;

    if (!tatamiId) {
      return res.status(400).json({ error: "Falta tatami" });
    }

    if (!tatamis[tatamiId]) {
      return res.status(404).json({ error: "Tatami no encontrado" });
    }

    const segundos = tatamis[tatamiId].timerCentral || 0;
    const minutos = segundos / 60;

    return res.json({ tatamiId, minutos });
  });
};
