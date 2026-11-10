export default function PrivateResult({ result, onContinue }) {
  if (!result) return null;

  return (
    <section className="private-result">
      <span className="game-eyebrow">
        🔍 INVESTIGATION INTEL
      </span>

      <h1>Subject: {result.targetName}</h1>

      <div
        className={
          result.isMafia
            ? "investigation-answer danger"
            : "investigation-answer safe"
        }
      >
        {result.isMafia
          ? "⚠️ GUILTY: This player belongs to the Mafia team!"
          : "✅ INNOCENT: This player is clean. NOT Mafia."}
      </div>

      <p>
        Keep this secret in memory, use it to your advantage.
      </p>

      <button className="game-primary" onClick={onContinue}>
        Got it, hide intelligence 👁️‍🗨️
      </button>
    </section>
  );
}