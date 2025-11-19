// routes/controlCombate.js
const express = require("express");
const router = express.Router();

// Objeto para almacenar estados de combate por tatami
let estadosCombate = {};

// POST /api/control-combate - Pausar/reanudar combate
router.post("/control-combate", (req, res) => {
  const { tatamiId, combatePausado, accion, tipo, timestamp } = req.body;
  
  console.log(`🎯 Control combate - Tatami ${tatamiId}: ${accion} (${tipo})`);
  
  // Validar tatamiId
  if (!tatamiId) {
    return res.status(400).json({ 
      success: false, 
      error: "tatamiId es requerido" 
    });
  }

  // Guardar estado en memoria
  estadosCombate[tatamiId] = {
    combatePausado: Boolean(combatePausado),
    accion,
    tipo,
    timestamp: timestamp || new Date().toISOString()
  };

  console.log(`✅ Estado actualizado - Tatami ${tatamiId}:`, estadosCombate[tatamiId]);
  
  res.json({ 
    success: true, 
    estado: combatePausado ? 'pausado' : 'reanudado',
    tatamiId: tatamiId,
    timestamp: estadosCombate[tatamiId].timestamp
  });
});

// GET /api/estado-combate - Consultar estado del combate
router.get("/estado-combate", (req, res) => {
  const { tatami } = req.query;
  
  if (!tatami) {
    return res.status(400).json({ 
      success: false, 
      error: "Parámetro 'tatami' es requerido" 
    });
  }

  const estado = estadosCombate[tatami] || { 
    combatePausado: false,
    accion: "ninguna",
    tipo: "normal",
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    combatePausado: estado.combatePausado,
    accion: estado.accion,
    tipo: estado.tipo,
    timestamp: estado.timestamp
  });
});

// GET /api/estados-combate - Obtener todos los estados (para debugging)
router.get("/estados-combate", (req, res) => {
  res.json({
    success: true,
    estados: estadosCombate,
    totalTatamis: Object.keys(estadosCombate).length
  });
});

// POST /api/reset-combate - Resetear estado de combate (para emergencias)
router.post("/reset-combate", (req, res) => {
  const { tatamiId } = req.body;
  
  if (tatamiId) {
    // Resetear un tatami específico
    delete estadosCombate[tatamiId];
    console.log(`🔄 Estado resetado para tatami ${tatamiId}`);
  } else {
    // Resetear todos
    estadosCombate = {};
    console.log("🔄 Todos los estados de combate resetados");
  }
  
  res.json({ 
    success: true, 
    message: "Estados resetados correctamente" 
  });
});

module.exports = router;