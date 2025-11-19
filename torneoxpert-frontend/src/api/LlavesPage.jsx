import { useEffect, useState } from "react";
import Bracket from "../components/Bracket/Bracket";

export default function LlavesPage() {
  const [bracket, setBracket] = useState(null);

  useEffect(() => {
    fetch("http://TU-BACKEND/api/llave/ID") // <--- Cambia endpoint real
      .then((r) => r.json())
      .then((data) => setBracket(data));
  }, []);

  if (!bracket) return <p>Cargando llaves...</p>;

  return (
    <div>
      <h1>Llaves del Torneo</h1>
      <Bracket rondas={bracket.rondas} />
    </div>
  );
}
