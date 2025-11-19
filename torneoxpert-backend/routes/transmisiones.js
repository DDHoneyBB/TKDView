const express = require("express");

module.exports = () => {
  const router = express.Router();

  // Array en memoria de transmisiones activas
  let transmisionesActivas = [];

  // ============================
  // 🟢 Iniciar o actualizar transmisión
  // ============================
  router.post("/iniciar-transmision", (req, res) => {
    try {
      const datosTransmision = req.body;

      if (!datosTransmision.grupo) {
        return res.status(400).json({ error: "El campo 'grupo' es requerido" });
      }

      const transmisionFormateada = {
        ...datosTransmision,
        tatamiNombre: datosTransmision.tatamiNombre || `Tatami ${datosTransmision.tatamiId || 1}`,
        combateActual: datosTransmision.combateActual ? {
          competidor1: {
            nombre: datosTransmision.combateActual.competidor1?.nombre || "Por definir",
            escuela: datosTransmision.combateActual.competidor1?.escuela || "",
            graduacion: datosTransmision.combateActual.competidor1?.graduacion || "",
            dorsal: datosTransmision.combateActual.competidor1?.dorsal || ""
          },
          competidor2: {
            nombre: datosTransmision.combateActual.competidor2?.nombre || "Por definir",
            escuela: datosTransmision.combateActual.competidor2?.escuela || "",
            graduacion: datosTransmision.combateActual.competidor2?.graduacion || "",
            dorsal: datosTransmision.combateActual.competidor2?.dorsal || ""
          }
        } : null,
        proximosCompetidores: Array.isArray(datosTransmision.proximosCompetidores) ? datosTransmision.proximosCompetidores : [],
        competidores: Array.isArray(datosTransmision.competidores) ? datosTransmision.competidores : [],
        timestamp: new Date().toISOString(),
        tatamiId: datosTransmision.tatamiId || 1
      };

      const index = transmisionesActivas.findIndex(t => t.grupo === datosTransmision.grupo);

      if (index !== -1) {
        transmisionesActivas[index] = transmisionFormateada;
      } else {
        transmisionesActivas.push(transmisionFormateada);
      }

      res.json({ 
        success: true,
        message: `Transmisión ${index !== -1 ? 'actualizada' : 'iniciada'} correctamente`
      });
    } catch (error) {
      console.error("❌ Error en iniciar-transmision:", error);
      res.status(500).json({ error: "Error interno del servidor", detalles: error.message });
    }
  });

  // ============================
  // 🟢 Obtener transmisiones activas
  // ============================
  router.get("/transmisiones-activas", (req, res) => {
    try {
      const ahora = new Date();
      const transmisionesFiltradas = transmisionesActivas.filter(t => {
        const diffHours = (ahora - new Date(t.timestamp)) / (1000 * 60 * 60);
        return diffHours < 24;
      });

      // Actualizar array global eliminando las muy antiguas
      transmisionesActivas = transmisionesFiltradas;

      // Formatear estructura consistente
      const transmisionesProcesadas = transmisionesFiltradas.map(t => ({
        grupo: t.grupo || `Grupo-${Date.now()}`,
        categoria: t.categoria || "Sin categoría",
        modalidad: t.modalidad || "combate",
        estado: t.estado || "transmitiendo",
        timestamp: t.timestamp,
        tatamiId: t.tatamiId || 1,
        combateActual: t.combateActual ? {
          competidor1: {
            nombre: t.combateActual.competidor1?.nombre || "Por definir",
            escuela: t.combateActual.competidor1?.escuela || "",
            graduacion: t.combateActual.combateActual?.competidor1?.graduacion || "",
            dorsal: t.combateActual.competidor1?.dorsal || ""
          },
          competidor2: {
            nombre: t.combateActual.competidor2?.nombre || "Por definir",
            escuela: t.combateActual.competidor2?.escuela || "",
            graduacion: t.combateActual.combateActual?.competidor2?.graduacion || "",
            dorsal: t.combateActual.competidor2?.dorsal || ""
          }
        } : null,
        proximosCompetidores: Array.isArray(t.proximosCompetidores) ? t.proximosCompetidores : [],
        competidores: Array.isArray(t.competidores) ? t.competidores : [],
        totalCompetidores: Array.isArray(t.competidores) ? t.competidores.length : 0
      }));

      res.json(transmisionesProcesadas);
    } catch (error) {
      console.error("❌ Error en transmisiones-activas:", error);
      res.status(500).json({ error: "Error interno del servidor", detalles: error.message });
    }
  });

  // ============================
  // 🟢 Detener transmisión
  // ============================
  router.post("/detener-transmision", (req, res) => {
    try {
      const { grupo } = req.body;

      if (!grupo) {
        return res.status(400).json({ error: "El campo 'grupo' es requerido" });
      }

      const longitudInicial = transmisionesActivas.length;
      transmisionesActivas = transmisionesActivas.filter(t => t.grupo !== grupo);

      res.json({ success: true, eliminadas: longitudInicial - transmisionesActivas.length });
    } catch (error) {
      console.error("❌ Error en detener-transmision:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  return router;
};
