export default function NightSummary({
  nightResult,
  aliveCount,
  onContinue
}) {
  const hasEliminations = nightResult?.eliminated?.length > 0;

  return (
    <section className="game-layout daytime-layout">
      <span className="game-eyebrow daytime-eyebrow">
        {hasEliminations ? "🩸 BLOODY NIGHT" : "☀️ SILENT MORNING"}
      </span>

      <h1 className="daytime-heading">
        {hasEliminations
          ? "Tragedy struck under the cover of darkness..."
          : "The morning sun rises over a peaceful town..."}
      </h1>

      {hasEliminations ? (
        <div className="elimination-list">
          {nightResult.eliminated.map(player => (
            <div
              className="elimination-item daytime-elimination"
              key={player.id}
            >
              <h2>💀 {player.name}</h2>
              <p>Was found murdered this morning.</p>
              <strong>{aliveCount} Players remaining</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-elimination daytime-box">
          🕊️ Peaceful Morning! No one was killed last night.
        </div>
      )}

      {nightResult?.savedPlayerName && (
        <div className="doctor-save-banner daytime-banner">
          🏥 <strong>Miraculous Save:</strong> The doctor saved{" "}
          <strong>{nightResult.savedPlayerName}</strong> from a mafia attack!
        </div>
      )}

      <button className="game-primary daytime-btn" onClick={onContinue}>
        Start Discussion 🗣️
      </button>
    </section>
  );
}