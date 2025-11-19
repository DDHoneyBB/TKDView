// =====================================================
// ✅ Plantillas completas de brackets según cantidad de competidores (2 a 16)
// =====================================================

const plantillasLlaves = {
  // --- 2 Competidores ---
  2: [
    {
      ronda: "Final",
      combates: [{ c1: 1, c2: 2 }],
    },
  ],

  // --- 3 Competidores ---
  3: [
    {
      ronda: "Semifinal",
      combates: [{ c1: 1, c2: 2 }],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 1", c2: 3 }],
    },
  ],

  // --- 4 Competidores ---
  4: [
    {
      ronda: "Semifinal",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 3, c2: 4 },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 1", c2: "Ganador 2" }],
    },
  ],

  // --- 5 Competidores ---
  5: [
    {
      ronda: "Cuartos",
      combates: [{ c1: 1, c2: 2 }],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 1", c2: 3 },
        { c1: 4, c2: 5 },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 2", c2: "Ganador 3" }],
    },
  ],

  // --- 6 Competidores ---
  6: [
    {
      ronda: "Cuartos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 5, c2: 6 },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 1", c2: 3 },
        { c1: "Ganador 2", c2: 4 },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 3", c2: "Ganador 4" }],
    },
  ],

  // --- 7 Competidores ---
  7: [
  {
    ronda: "Cuartos",
    combates: [
      { c1: 1, c2: 2 },  // Combate 1
      { c1: 4, c2: 5 },  // Combate 2
      { c1: 6, c2: 7 },  // Combate 3
    ],
  },
  {
    ronda: "Semifinal",
    combates: [
      { c1: "Ganador 1", c2: 3 },         // Semifinal 1
      { c1: "Ganador 2", c2: "Ganador 3" } // Semifinal 2
    ],
  },
  {
    ronda: "Final",
    combates: [
      { c1: "Ganador 4", c2: "Ganador 5" } // Final
    ],
  },
],

  // --- 8 Competidores ---
  8: [
    {
      ronda: "Cuartos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 3, c2: 4 },
        { c1: 5, c2: 6 },
        { c1: 7, c2: 8 },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 1", c2: "Ganador 2" },
        { c1: "Ganador 3", c2: "Ganador 4" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 5", c2: "Ganador 6" }],
    },
  ],

  // --- 9 a 11 Competidores ---
  9: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: 4, c2: 5 },
        { c1: "Ganador 1", c2: 3 },
        { c1: 6, c2: 7 },
        { c1: 8, c2: 9 },
        
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 2", c2: "Ganador 3" },
        { c1: "Ganador 4", c2: "Ganador 5" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 6", c2: "Ganador 7" }],
    },
  ],

10: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 6, c2: 7 },

      ],
    },
    {
      ronda: "Cuartos",
      combates: [

        { c1: "Ganador 1", c2: 3 },
        { c1: 4, c2: 5 },
        { c1: "Ganador 2", c2: 8 },
        { c1: 9, c2: 10 },


      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 3", c2: "Ganador 4" },
        { c1: "Ganador 5", c2: "Ganador 6" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 7", c2: "Ganador 8" }],
    },
  ],


  11: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 6, c2: 7 },
        { c1: 10, c2: 11 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: 4, c2: 5 },
        { c1: "Ganador 1", c2: 3 },
        { c1: "Ganador 2", c2: 8 },
        { c1: "Ganador 3", c2: 9 },

      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 4", c2: "Ganador 5" },
        { c1: "Ganador 6", c2: "Ganador 7" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 8", c2: "Ganador 9" }],
    },
  ],

  // --- 12 Competidores ---
  12: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 3, c2: 4 },
        { c1: 5, c2: 6 },
        { c1: 7, c2: 8 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: "Ganador 1", c2: 9 },
        { c1: "Ganador 2", c2: 10 },
        { c1: "Ganador 3", c2: 11 },
        { c1: "Ganador 4", c2: 12 },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 5", c2: "Ganador 6" },
        { c1: "Ganador 7", c2: "Ganador 8" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 9", c2: "Ganador 10" }],
    },
  ],

  // --- 13 a 15 Competidores ---
  13: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 3, c2: 4 },
        { c1: 5, c2: 6 },
        { c1: 7, c2: 8 },
        { c1: 9, c2: 10 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: "Ganador 1", c2: 11 },
        { c1: "Ganador 2", c2: 12 },
        { c1: "Ganador 3", c2: 13 },
        { c1: "Ganador 4", c2: "Ganador 5" },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 6", c2: "Ganador 7" },
        { c1: "Ganador 8", c2: "Ganador 9" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 10", c2: "Ganador 11" }],
    },
  ],

  14: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 4, c2: 5 },
        { c1: 6, c2: 7 },
        { c1: 8, c2: 9 },
        { c1: 11, c2: 12 },
        { c1: 13, c2: 14 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: "Ganador 1", c2: 3 },
        { c1: "Ganador 2", c2: "Ganador 3" },
        { c1: "Ganador 4", c2: 10 },
        { c1: "Ganador 5", c2: "Ganador 6" },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 7", c2: "Ganador 8" },
        { c1: "Ganador 9", c2: "Ganador 10" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 11", c2: "Ganador 12" }],
    },
  ],

  15: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 4, c2: 5 },
        { c1: 6, c2: 7 },
        { c1: 8, c2: 9 },
        { c1: 10, c2: 11 },
        { c1: 12, c2: 13 },
        { c1: 14, c2: 15 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: "Ganador 1", c2: 3 },
        { c1: "Ganador 2", c2: "Ganador 3" },
        { c1: "Ganador 4", c2: "Ganador 5" },
        { c1: "Ganador 6", c2: "Ganador 7" },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 8", c2: "Ganador 9" },
        { c1: "Ganador 10", c2: "Ganador 11" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 12", c2: "Ganador 13" }],
    },
  ],

  // --- 16 Competidores ---
  16: [
    {
      ronda: "Octavos",
      combates: [
        { c1: 1, c2: 2 },
        { c1: 3, c2: 4 },
        { c1: 5, c2: 6 },
        { c1: 7, c2: 8 },
        { c1: 9, c2: 10 },
        { c1: 11, c2: 12 },
        { c1: 13, c2: 14 },
        { c1: 15, c2: 16 },
      ],
    },
    {
      ronda: "Cuartos",
      combates: [
        { c1: "Ganador 1", c2: "Ganador 2" },
        { c1: "Ganador 3", c2: "Ganador 4" },
        { c1: "Ganador 5", c2: "Ganador 6" },
        { c1: "Ganador 7", c2: "Ganador 8" },
      ],
    },
    {
      ronda: "Semifinal",
      combates: [
        { c1: "Ganador 9", c2: "Ganador 10" },
        { c1: "Ganador 11", c2: "Ganador 12" },
      ],
    },
    {
      ronda: "Final",
      combates: [{ c1: "Ganador 13", c2: "Ganador 14" }],
    },
  ],
};



// =====================================================
// ✅ Generar estructura del bracket con competidores reales
// =====================================================

function crearEstructuraBracket(listaCompetidores = []) {
  // ✅ Si es impar, agregamos un "BYE" (pase directo)
  let competidores = [...listaCompetidores];
  if (competidores.length % 2 !== 0) {
    competidores.push({ nombre: "BYE" });
  }

  // ✅ Calcular cantidad real ajustada
  const cantidad = Math.min(competidores.length, 16);
  let plantilla = plantillasLlaves[cantidad];

  // ✅ Si no existe plantilla exacta, usar la siguiente menor
  if (!plantilla) {
    const opciones = [16, 8, 4, 2].filter(n => n <= cantidad);
    plantilla = plantillasLlaves[opciones.pop()];
  }

  if (!plantilla) {
    console.warn(`⚠️ No hay plantilla válida para ${cantidad} competidores`);
    return { rondas: [] };
  }

  const getCompetidor = (id) => {
    if (typeof id === "number") {
      return competidores[id - 1]?.nombre || "BYE";
    }

    // 👇 Evita mostrar "Ganador X" en las cajas vacías
    if (typeof id === "string" && id.startsWith("Ganador")) {
      return null;
    }

    return id;
  };

  const rondas = plantilla.map((ronda) => ({
    ronda: ronda.ronda,
    combates: ronda.combates.map((combate, idx) => ({
      id: `${ronda.ronda}_${idx + 1}`,
      a: getCompetidor(combate.c1),
      b: getCompetidor(combate.c2),
      ganador: null,
    })),
  }));

  return { rondas };
}

// =====================================================
// ✅ Función auxiliar: asegurar número válido entre 2 y 16
// =====================================================

function ajustarNumeroPar(num) {
  if (num < 2) return 2;
  if (num > 16) return 16;
  return num;
}

console.log("crearEstructuraBracket:", crearEstructuraBracket);


module.exports = { plantillasLlaves, crearEstructuraBracket };