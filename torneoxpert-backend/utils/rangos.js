// ==================== UTILS DE RANGOS ====================

/**
 * Determina el rango de edad basado en la edad proporcionada
 * @param {number} edad - Edad del competidor
 * @returns {string} Rango de edad
 */
function getRangoEdad(edad) {
  if (edad >= 4 && edad <= 5) return "Infantil4-5";
  if (edad >= 6 && edad <= 7) return "Infantil6-7";
  if (edad >= 8 && edad <= 9) return "Infantil8-9";
  if (edad >= 10 && edad <= 11) return "Infantil10-11";
  if (edad >= 12 && edad <= 13) return "Infantil12-13";
  if (edad >= 14 && edad <= 15) return "Juvenil14-15";
  if (edad >= 16 && edad <= 17) return "Juvenil16-17";
  if (edad >= 18 && edad <= 34) return "Adulto18-34";
  if (edad >= 35 && edad <= 44) return "Veterano35-44";
  if (edad >= 45 && edad <= 59) return "Veterano45-59";
  return "otros";
}

/**
 * Determina el rango de graduación basado en la graduación proporcionada
 * @param {string} graduacion - Graduación del competidor
 * @returns {string} Rango de graduación
 */
function getRangoGraduacion(graduacion) {
  graduacion = graduacion ? graduacion.toLowerCase() : "";

  if (graduacion.includes("blanco") || graduacion.includes("punta amarilla")) {
    return "Blancos y PuntaAmarilla";
  }

  if (
    graduacion.includes("amarillo") ||
    graduacion.includes("punta verde") ||
    graduacion.includes("verde") ||
    graduacion.includes("punta azul")
  ) {
    return "Amarillos a Verdes PuntaAzul";
  }

  if (
    graduacion.includes("azul") ||
    graduacion.includes("punta roja") ||
    graduacion.includes("rojo") ||
    graduacion.includes("punta negra")
  ) {
    return "Azules a Rojos PuntaNegra";
  }

  if (
    graduacion.includes("i dan") ||
    graduacion.includes("ii dan") ||
    graduacion.includes("iii dan")
  ) {
    return "Dan I-III";
  }

  if (
    graduacion.includes("iv dan") ||
    graduacion.includes("v dan") ||
    graduacion.includes("vi dan")
  ) {
    return "Dan IV-VI";
  }

  return "otros";
}

/**
 * Determina el rango de peso basado en peso, género y rango de edad
 * @param {number} peso - Peso del competidor
 * @param {string} genero - Género del competidor
 * @param {string} rangoEdad - Rango de edad del competidor
 * @returns {string} Rango de peso
 */
function getRangoPeso(peso, genero, rangoEdad) {
  peso = Number(peso);

  // Rangos para Juvenil14-15
  if (rangoEdad === "Juvenil14-15") {
    if (genero === "masculino") {
      if (peso <= 45) return "-45kg";
      if (peso <= 50) return "-50kg";
      if (peso <= 55) return "-55kg";
      if (peso <= 60) return "-60kg";
      if (peso <= 65) return "-65kg";
      if (peso <= 70) return "-70kg";
      return "+70kg";
    } else {
      if (peso <= 40) return "-40kg";
      if (peso <= 45) return "-45kg";
      if (peso <= 50) return "-50kg";
      if (peso <= 55) return "-55kg";
      if (peso <= 60) return "-60kg";
      if (peso <= 65) return "-65kg";
      return "+65kg";
    }
  }

  // Rangos para Juvenil16-17
  if (rangoEdad === "Juvenil16-17") {
    if (genero === "masculino") {
      if (peso <= 45) return "-45kg";
      if (peso <= 51) return "-51kg";
      if (peso <= 57) return "-57kg";
      if (peso <= 63) return "-63kg";
      if (peso <= 69) return "-69kg";
      if (peso <= 75) return "-75kg";
      return "+75kg";
    } else {
      if (peso <= 40) return "-40kg";
      if (peso <= 46) return "-46kg";
      if (peso <= 52) return "-52kg";
      if (peso <= 58) return "-58kg";
      if (peso <= 64) return "-64kg";
      if (peso <= 70) return "-70kg";
      return "+70kg";
    }
  }

  // Rangos para Adulto18-34, Veterano35-44 y Veterano45-59
  if (["Adulto18-34", "Veterano35-44", "Veterano45-59"].includes(rangoEdad)) {
    if (genero === "masculino") {
      if (peso <= 52) return "-52kg";
      if (peso <= 58) return "-58kg";
      if (peso <= 64) return "-64kg";
      if (peso <= 71) return "-71kg";
      if (peso <= 78) return "-78kg";
      if (peso <= 85) return "-85kg";
      if (peso <= 92) return "-92kg";
      return "+92kg";
    } else {
      if (peso <= 47) return "-47kg";
      if (peso <= 52) return "-52kg";
      if (peso <= 57) return "-57kg";
      if (peso <= 62) return "-62kg";
      if (peso <= 67) return "-67kg";
      if (peso <= 72) return "-72kg";
      if (peso <= 77) return "-77kg";
      return "+77kg";
    }
  }

  return "otros";
}

/**
 * Busca un rival para exhibición basado en el competidor y la lista de todos los competidores
 * @param {Object} competidor - Competidor para el que buscar rival
 * @param {Array} todos - Lista de todos los competidores
 * @returns {Object|null} Rival encontrado o null si no hay
 */
function buscarRivalExhibicion(competidor, todos) {
  const rivales = todos.filter(
    (c) => c.genero === competidor.genero && c.id !== competidor.id
  );
  rivales.sort(
    (a, b) =>
      Math.abs(a.edad - competidor.edad) - Math.abs(b.edad - competidor.edad)
  );
  return rivales[0] || null;
}

// Exportar todas las funciones
module.exports = {
  getRangoEdad,
  getRangoGraduacion,
  getRangoPeso,
  buscarRivalExhibicion,
};
