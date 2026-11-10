export default function VoteHandoff({
  voter,
  voteIndex,
  playerCount,
  onReveal
}) {
  if (!voter) return null;

  return (
    <section className="handoff-card daytime-layout voting-handoff">
      <span className="game-eyebrow daytime-eyebrow">
        ☀️ TOWN VOTING
      </span>

      <h1 className="daytime-heading">
        Time to make your judgment.
      </h1>

      <p className="daytime-desc">
        Pass the device to the next voter. Make sure previous players
        cannot see your ballot.
      </p>

      <div className="handoff-player daytime-player">
        👤 {voter.name}
      </div>

      <div className="turn-counter daytime-counter">
        VOTER {voteIndex + 1} OF {playerCount}
      </div>

      <button className="game-primary daytime-btn" onClick={onReveal}>
        I am {voter.name} — Cast My Vote 🗳️
      </button>
    </section>
  );
}