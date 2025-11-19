import FightBox from "./FightBox";

export default function RoundColumn({ ronda }) {
  return (
    <div className="ronda-col">
      <h3>{ronda.ronda}</h3>

      {ronda.combates.map((fight) => (
        <FightBox key={fight.id} fight={fight} />
      ))}
    </div>
  );
}
