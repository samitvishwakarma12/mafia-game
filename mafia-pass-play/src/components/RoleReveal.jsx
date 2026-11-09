
import { useState } from "react";
import "./RoleReveal.css";

import { getRole } from "../game/roles";

function RoleReveal({ players, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const currentPlayer = players[currentIndex];
  const currentRole = getRole(currentPlayer.roleId);

  const mafiaTeammates = players.filter(
    (player) =>
      player.roleId === "mafia" &&
      player.id !== currentPlayer.id
  );

  const handleNext = () => {
    if (currentIndex === players.length - 1) {
      onComplete(players);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setRevealed(false);
  };

  if (!currentPlayer || !currentRole) {
    return (
      <main className="reveal-page">
        <div className="reveal-container">
          <h2>Something went wrong.</h2>
          <button className="reveal-back" onClick={onBack}>
            Back to rules
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="reveal-page">
      <div className="reveal-container">
        <div className="reveal-progress">
          <span>ROLE DISTRIBUTION</span>
          <span>
            {currentIndex + 1} / {players.length}
          </span>
        </div>

        <div className="reveal-progress-track">
          <div
            className="reveal-progress-fill"
            style={{
              width: `${((currentIndex + 1) / players.length) * 100}%`
            }}
          />
        </div>

        {!revealed ? (
          <section className="reveal-handoff">
            <div className="reveal-lock">🔒</div>

            <span className="reveal-eyebrow">
              PASS THE DEVICE
            </span>

            <h1>{currentPlayer.name}</h1>

            <p>
              Make sure nobody else is looking at the screen.
              When you're ready, reveal your role.
            </p>

            <button
              className="reveal-primary"
              onClick={() => setRevealed(true)}
            >
              Reveal my role
            </button>
          </section>
        ) : (
          <section className="reveal-role-card">
            <span className="reveal-eyebrow">
              YOUR ROLE
            </span>

            <div className={`reveal-role-icon ${currentRole.team}`}>
              {currentRole.icon ?? "?"}
            </div>

            <span className={`reveal-team ${currentRole.team}`}>
              {currentRole.team === "mafia" ? "MAFIA" : "TOWN"}
            </span>

            <h1>{currentRole.name}</h1>

            <p>{currentRole.description}</p>

            {currentRole.action && (
              <div className="reveal-ability">
                <span>YOUR ABILITY</span>

                <strong>{currentRole.action.label}</strong>

                <p>{currentRole.action.description}</p>
              </div>
            )}

            {currentPlayer.roleId === "mafia" && (
              <div className="reveal-teammates">
                <span>YOUR TEAM</span>

                {mafiaTeammates.length > 0 ? (
                  <p>
                    {mafiaTeammates
                      .map((player) => player.name)
                      .join(", ")}
                  </p>
                ) : (
                  <p>You are the only Mafia member.</p>
                )}
              </div>
            )}

            <button
              className="reveal-primary"
              onClick={handleNext}
            >
              {currentIndex === players.length - 1
                ? "Finish role distribution"
                : "Hide role and continue"}
            </button>
          </section>
        )}

        <button className="reveal-back" onClick={onBack}>
          Back to rules
        </button>
      </div>
    </main>
  );
}

export default RoleReveal;
