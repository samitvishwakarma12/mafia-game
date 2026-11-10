export default function GameHeader({
  isDaytimePhase,
  round,
  aliveCount
}) {
  return (
    <header className="game-navbar">
      <div className="game-round">
        {isDaytimePhase ? "☀️" : "🌙"} ROUND {round}
      </div>

      <div className="game-status">
        👥 {aliveCount} alive
      </div>
    </header>
  );
}