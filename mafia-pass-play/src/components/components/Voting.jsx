import ErrorMessage from "./ErrorMessage";

export default function Voting({
  alivePlayers,
  voter,
  selectedTarget,
  setSelectedTarget,
  error,
  onSubmit
}) {
  if (!voter) return null;

  return (
    <section className="game-layout daytime-layout voting-phase">
      <span className="game-eyebrow daytime-eyebrow">
        ⚖️ SECRET VOTING
      </span>

      <h1 className="daytime-heading">
        Who do you think is suspicious?
      </h1>

      <p className="daytime-desc">
        Select the player you believe to the Mafia.
        Your vote will remain a SECRET.
      </p>

      <div className="voting-instructions">
        <span>🗳️</span>

        <div>
          <strong>Make your decision carefully</strong>
          <p>Once submitted, your vote cannot be changed.</p>
        </div>
      </div>

      <div className="target-list daytime-target-list">
        {alivePlayers
          .filter(player => player.id !== voter.id)
          .map(player => (
            <button
              key={player.id}
              className={
                selectedTarget === player.id
                  ? "target-option daytime-target selected"
                  : "target-option daytime-target"
              }
              onClick={() => setSelectedTarget(player.id)}
            >
              <span>👤 {player.name}</span>

              <span className="vote-selection-indicator">
                {selectedTarget === player.id ? "✓" : ""}
              </span>
            </button>
          ))}
      </div>

      <button
        className={
          selectedTarget === ""
            ? "target-option daytime-abstain selected"
            : "target-option daytime-abstain"
        }
        onClick={() => setSelectedTarget("")}
      >
        💤 No vote
      </button>

      <ErrorMessage error={error} />

      <button className="game-primary daytime-btn" onClick={onSubmit}>
        Submit Vote 🔒
      </button>
    </section>
  );
}