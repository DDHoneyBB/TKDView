const express = require('express');
const router = express.Router();
const db = require('../database');

// Array temporal en memoria para almacenar controles
let controlesStorage = [];

// Endpoint para guardar controles
router.post('/guardar', (req, res) => {
  try {
    const { tatamiId, enlaces, competidores, estadoCombate } = req.body;
    
    const control = {
      id: Date.now().toString(),
      tatamiId,
      enlaces,
      competidores: competidores || [],
      estadoCombate: estadoCombate || 'pausado',
      fechaCreacion: new Date().toISOString(),
      activo: true
    };
    
    // Agregar a storage
    controlesStorage.push(control);
    
    // Mantener solo los últimos 100 controles para no saturar memoria
    if (controlesStorage.length > 100) {
      controlesStorage = controlesStorage.slice(-100);
    }
    
    console.log(`📋 Controles guardados para tatami ${tatamiId}:`, control.enlaces.length, 'enlaces');
    
    res.json({ 
      success: true, 
      message: 'Controles guardados correctamente',
      control 
    });
    
  } catch (error) {
    console.error('Error guardando controles:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint para obtener controles por tatami
router.get('/tatami/:tatamiId', (req, res) => {
  try {
    const { tatamiId } = req.params;
    const controles = controlesStorage
      .filter(control => control.tatamiId === tatamiId && control.activo)
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)); // Más recientes primero
    
    res.json({ 
      success: true, 
      controles 
    });
    
  } catch (error) {
    console.error('Error obteniendo controles por tatami:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint para obtener todos los controles
router.get('/todos', (req, res) => {
  try {
    const controles = controlesStorage
      .filter(control => control.activo)
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    
    res.json({ 
      success: true, 
      controles,
      total: controles.length
    });
    
  } catch (error) {
    console.error('Error obteniendo todos los controles:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint para limpiar controles antiguos (opcional)
router.delete('/limpiar', (req, res) => {
  try {
    const limite = 50; // Mantener solo los últimos 50 controles
    if (controlesStorage.length > limite) {
      controlesStorage = controlesStorage.slice(-limite);
    }
    
    res.json({ 
      success: true, 
      message: `Controles limpiados. Se mantienen ${controlesStorage.length} controles.`
    });
    
  } catch (error) {
    console.error('Error limpiando controles:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;