export default function VoteSummary({
  voteResult,
  aliveCount,
  onNextRound
}) {
  return (
    <section className="game-layout daytime-layout">
      <span className="game-eyebrow daytime-eyebrow">
        ⚖️ TOWN JUDGMENT
      </span>

      <h1 className="daytime-heading">
        The votes have been tallied.
      </h1>

      {voteResult?.eliminated ? (
        <div className="elimination-list">
          <div className="elimination-item daytime-elimination">
            <h2>🔨 {voteResult.eliminated.name}</h2>

            <p>
              Has been voted out and lynched by majority town decision.
            </p>

            <strong>{aliveCount}</strong>
          </div>
        </div>
      ) : (
        <div className="no-elimination daytime-box">
          ⚖️ The vote ended in a tie. No one was lynched today!
        </div>
      )}

      <button className="game-primary daytime-btn" onClick={onNextRound}>
        Advance to Next Night 🌙
      </button>
    </section>
  );
}