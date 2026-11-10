export default function ActionHandoff({
  player,
  turnIndex,
  playerCount,
  onReveal
}) {
  if (!player) return null;

  return (
    <section className="handoff-card">
      <span className="game-eyebrow">
        🌙 NIGHTFALL PHASE
      </span>

      <h1>Pass the device to</h1>

      <div className="handoff-player">
        📱 {player.name}
      </div>

      <p>
        Ensure no one else is looking. Tap below when you hold
        the device securely in your hands.
      </p>

      <div className="turn-counter">
        Player {turnIndex + 1} of {playerCount}
      </div>

      <button className="game-primary" onClick={onReveal}>
        I am {player.name} — Open Secret Screen 🔒
      </button>
    </section>
  );
}