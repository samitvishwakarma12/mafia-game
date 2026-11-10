function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function Discussion({
  timeLeft,
  timerActive,
  onToggleTimer,
  onAddTime,
  onBeginVoting
}) {
  return (
    <section className="game-layout daytime-layout discussion-phase">
      <span className="game-eyebrow daytime-eyebrow">
        ☕ TOWN HALL MEETING
      </span>

      <h1 className="daytime-heading">
        Everyone can speak now.
      </h1>

      <p className="daytime-desc">
        Talk openly, debate known facts, prove your innocence,
        and expose the Mafia!
      </p>

      <div className="timer-display-box daytime-timer-box">
        <span className="timer-clock-icon">⏳</span>

        <div className="timer-countdown">
          {formatTimer(timeLeft)}
        </div>

        <span className="timer-label">
          Remaining Time
        </span>
      </div>

      <div className="timer-controls">
        <button
          className="timer-toggle-btn daytime-sub-btn"
          onClick={onToggleTimer}
        >
          {timerActive ? "⏸️ Pause Timer" : "▶️ Resume Timer"}
        </button>

        <button
          className="timer-add-btn daytime-sub-btn"
          onClick={onAddTime}
        >
          ➕ Add 30s
        </button>
      </div>

      <button className="game-primary daytime-btn" onClick={onBeginVoting}>
        Proceed to Voting 🗳️
      </button>
    </section>
  );
}