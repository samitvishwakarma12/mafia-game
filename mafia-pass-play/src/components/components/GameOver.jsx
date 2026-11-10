import { getRole } from "../../game/roles";

export default function GameOver({ winner, players, onBack }) {
  return (
    <section className="game-over daytime-layout">
      <div className="winner-icon">
        {winner === "town" ? "☀️" : "♠️"}
      </div>

      <span className="game-eyebrow daytime-eyebrow">
        🏆 GAME CONCLUDED
      </span>

      <h1 className="daytime-heading">
        {winner === "town"
          ? "The CITIZENS Triumphed!"
          : "The MAFIAS Conquered!"}
      </h1>

      <p className="daytime-desc">
        {winner === "town"
          ? "All MAFIA members have been removed from town. CITIZENS wins"
          : "The MAFIA members rule over CITIZENS. MAFIA wins."}
      </p>

      <h3>📜 Final Role Ledger</h3>

      <div className="final-players">
        {players.map(player => (
          <div className="final-player" key={player.id}>
            <span>👤 {player.name}</span>

            <strong>
              {getRole(player.roleId)?.name}
            </strong>

            <span className={player.alive ? "status-alive" : "status-dead"}>
              {player.alive ? "🟢 Alive" : "🔴 Dead"}
            </span>
          </div>
        ))}
      </div>

      <button className="game-primary daytime-btn" onClick={onBack}>
        Return to Setup 🏠
      </button>
    </section>
  );
}