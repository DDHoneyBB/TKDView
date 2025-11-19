// testImport.js
// Ajusta el path según tu estructura real
const modulo = require(path.join(__dirname, "utils", "plantillasLlaves"));

console.log("Módulo importado:", modulo);
console.log("crearEstructuraBracket:", modulo.crearEstructuraBracket);

if (typeof modulo.crearEstructuraBracket === "function") {
  console.log("✅ crearEstructuraBracket se importó correctamente");
} else {
  console.log("❌ crearEstructuraBracket NO se importó");
}
