import { useState, useEffect } from "react";
import "./Game.css";

import { getRole } from "../game/roles";

import {
  getAlivePlayers,
  getEligibleTargets,
  resolveNight,
  resolveVoting,
  getWinner
} from "../game/gameLogic";

function Game({ settings, initialPlayers, onBack }) {
  const [phase, setPhase] = useState("action-handoff");

  const [players, setPlayers] = useState(initialPlayers ?? []);
  const [round, setRound] = useState(1);

  // Night actions
  const [turnIndex, setTurnIndex] = useState(0);
  const [actions, setActions] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [actionAbstained, setActionAbstained] = useState(false);

  // Night results & Private Investigation
  const [nightResult, setNightResult] = useState(null);
  const [privateResults, setPrivateResults] = useState([]);
  const [privateIndex, setPrivateIndex] = useState(0);

  // Discussion Timer State (90 seconds = 1:30)
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);

  // Voting
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [voteResult, setVoteResult] = useState(null);

  // Game result
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState("");

  const alivePlayers = getAlivePlayers(players);

  const safeTurnIndex = Math.min(turnIndex, Math.max(0, alivePlayers.length - 1));
  const currentActionPlayer = alivePlayers[safeTurnIndex];

  const currentRole = currentActionPlayer
    ? getRole(currentActionPlayer.roleId)
    : null;

  const safeVoteIndex = Math.min(voteIndex, Math.max(0, alivePlayers.length - 1));
  const currentVoter = alivePlayers[safeVoteIndex];

  const currentPrivateResult = privateResults[privateIndex];

  const eligibleTargets = currentActionPlayer
    ? getEligibleTargets(currentActionPlayer, players)
    : [];

  useEffect(() => {
    let interval = null;
    if (phase === "discussion" && timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [phase, timerActive, timeLeft]);

  const checkWinner = (updatedPlayers) => {
    const result = getWinner(updatedPlayers);

    if (result) {
      setWinner(result);
      setPhase("game-over");
      return true;
    }

    return false;
  };

  const revealAction = () => {
    setSelectedTarget("");
    setActionAbstained(false);
    setError("");
    setPhase("action");
  };

  const submitAction = () => {
    if (!currentActionPlayer || !currentRole) return;

    const actionType = currentRole.action?.type ?? "none";
    const canAbstain = actionType === "mafiaVote" || actionType === "protect" || actionType === "investigate";

    if (
      currentRole.action &&
      !selectedTarget &&
      (!canAbstain || !actionAbstained)
    ) {
      setError("⚠️ Please pick someone or choose the special abstain option below.");
      return;
    }

    if (
      selectedTarget &&
      !eligibleTargets.some(target => target.id === selectedTarget)
    ) {
      setError("🚫 That player is no longer a valid target.");
      return;
    }

    const action = {
      playerId: currentActionPlayer.id,
      type: actionType,
      targetId: selectedTarget || null
    };

    setActions(prev => {
      const updated = [...prev, action];

      if (action.type === "investigate" && action.targetId) {
        const target = players.find(p => p.id === action.targetId);
        if (target) {
          setPrivateResults([{
            playerId: currentActionPlayer.id,
            targetName: target.name,
            isMafia: target.roleId === "mafia"
          }]);
          setPrivateIndex(0);
          setPhase("private-result");
        }
      } else {
        if (safeTurnIndex + 1 < alivePlayers.length) {
          setTurnIndex(safeTurnIndex + 1);
          setPhase("action-handoff");
        } else {
          finishNight(updated);
        }
      }

      return updated;
    });

    setError("");
  };

  const finishNight = (submittedActions) => {
    const result = resolveNight(players, submittedActions);

    setPlayers(result.players);
    setNightResult(result);
    setPrivateResults([]);
    setPrivateIndex(0);

    setPhase("night-summary");
  };

  const finishPrivateResult = () => {
    setPrivateResults([]);
    setPrivateIndex(0);

    if (safeTurnIndex + 1 < alivePlayers.length) {
      setTurnIndex(safeTurnIndex + 1);
      setPhase("action-handoff");
    } else {
      finishNight(actions);
    }
  };

  const startDiscussionPhase = () => {
    if (checkWinner(players)) return;
    setTimeLeft(90);
    setTimerActive(true);
    setPhase("discussion");
  };

  const beginVoting = () => {
    setTimerActive(false);
    setVoteIndex(0);
    setVotes([]);
    setSelectedTarget("");
    setError("");
    setPhase("vote-handoff");
  };

  const revealVote = () => {
    setSelectedTarget("");
    setError("");
    setPhase("vote");
  };

  const submitVote = () => {
    if (!currentVoter) return;

    const vote = {
      playerId: currentVoter.id,
      targetId: selectedTarget || null
    };

    setVotes(prev => {
      const updated = [...prev, vote];

      if (safeVoteIndex + 1 < alivePlayers.length) {
        setVoteIndex(safeVoteIndex + 1);
        setPhase("vote-handoff");
      } else {
        finishVoting(updated);
      }

      return updated;
    });

    setError("");
  };

  const finishVoting = (submittedVotes) => {
    const result = resolveVoting(players, submittedVotes);

    setPlayers(result.players);
    setVoteResult(result);

    const gameWinner = getWinner(result.players);
    if (gameWinner) {
      setWinner(gameWinner);
      setPhase("game-over");
      return;
    }

    setPhase("vote-summary");
  };

  const nextRound = () => {
    if (checkWinner(players)) return;

    setRound(r => r + 1);
    setTurnIndex(0);
    setActions([]);
    setNightResult(null);
    setPrivateResults([]);
    setPrivateIndex(0);
    setVoteIndex(0);
    setVotes([]);
    setVoteResult(null);
    setSelectedTarget("");
    setActionAbstained(false);
    setError("");

    setPhase("action-handoff");
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const GameHeader = () => (
    <header className="game-navbar">
      <div className="game-round">
        {isDaytimePhase ? "☀️" : "🌙"} ROUND {round}
      </div>
      <div className="game-status">👥 {alivePlayers.length} alive</div>
    </header>
  );

  const ErrorMessage = () => (
    error ? <div className="game-error">{error}</div> : null
  );

  const isDaytimePhase = [
    "night-summary",
    "discussion",
    "vote-handoff",
    "vote",
    "vote-summary",
    "game-over"
  ].includes(phase);

  return (
    <main className={isDaytimePhase ? "game-page daytime-page-bg" : "game-page"}>
      <GameHeader />

      <div className="game-container">

        {/* 1. NIGHT ACTION HANDOFF */}
        {phase === "action-handoff" && currentActionPlayer && (
          <section className="handoff-card">
            <span className="game-eyebrow">🌙 NIGHTFALL PHASE</span>
            <h1>Pass the device to</h1>
            <div className="handoff-player">📱 {currentActionPlayer.name}</div>
            <p>Ensure no one else is looking. Tap below when you hold the device securely in your hands.</p>
            <div className="turn-counter">Player {safeTurnIndex + 1} of {alivePlayers.length}</div>
            <button className="game-primary" onClick={revealAction}>
              I am {currentActionPlayer.name} — Open Secret Screen 🔒
            </button>
          </section>
        )}

        {/* 2. SECRET NIGHT ACTION SCREEN */}
        {phase === "action" && currentActionPlayer && currentRole && (
          <section className="action-card">
            <span className="game-eyebrow">🔐 SECRET ROLE BRIEFING</span>

            <div className={`role-display ${currentRole.team}`}>
              <div className="role-display-icon">{currentRole.icon ?? "❓"}</div>
              <span>{currentRole.team.toUpperCase()} ALLIANCE</span>
              <h1>{currentRole.name}</h1>
              <p>{currentRole.description}</p>
            </div>

            {currentRole.team === "mafia" && (
              <div className="teammates">
                <strong>👥 Your Syndicate Associates:</strong>
                <p>
                  {players
                    .filter(p => p.roleId === "mafia" && p.id !== currentActionPlayer.id && p.alive)
                    .map(p => p.name)
                    .join(", ") || "You operate completely alone in the shadows."}
                </p>
              </div>
            )}

            {currentRole.action && (
              <>
                <h3>🎯 {currentRole.action.label}</h3>
                <p>{currentRole.action.description}</p>

                <div className="target-list">
                  {eligibleTargets.map(target => (
                    <button
                      key={target.id}
                      className={selectedTarget === target.id ? "target-option selected" : "target-option"}
                      onClick={() => {
                        setSelectedTarget(target.id);
                        setActionAbstained(false);
                      }}
                    >
                      👤 {target.name} {target.id === currentActionPlayer.id ? " (Self)" : ""}
                    </button>
                  ))}
                </div>

                {currentRole.action.type === "mafiaVote" && (
                  <button
                    className={actionAbstained ? "target-option abstain selected" : "target-option abstain"}
                    onClick={() => {
                      setSelectedTarget("");
                      setActionAbstained(true);
                    }}
                  >
                    🔪 Mafia Blood-Truc: Abstain & commit no assassination tonight
                  </button>
                )}

                {currentRole.action.type === "protect" && (
                  <button
                    className={actionAbstained ? "target-option abstain selected" : "target-option abstain"}
                    onClick={() => {
                      setSelectedTarget("");
                      setActionAbstained(true);
                    }}
                  >
                    🏥 Medical Rest: Skip healing anyone and take the night off
                  </button>
                )}

                {currentRole.action.type === "investigate" && (
                  <button
                    className={actionAbstained ? "target-option abstain selected" : "target-option abstain"}
                    onClick={() => {
                      setSelectedTarget("");
                      setActionAbstained(true);
                    }}
                  >
                    💤 Skip Investigation: Stay quiet and investigate no one tonight
                  </button>
                )}
              </>
            )}

            {!currentRole.action && (
              <div className="no-elimination">
                🌟 You have no midnight duties. Rest peacefully until morning.
              </div>
            )}

            <ErrorMessage />

            <button className="game-primary" onClick={submitAction}>
              Confirm & Conceal Role 🙈
            </button>
          </section>
        )}

        {/* 3. DETECTIVE PRIVATE INVESTIGATION RESULT */}
        {phase === "private-result" && currentPrivateResult && (
          <section className="private-result">
            <span className="game-eyebrow">🔍 INVESTIGATION INTEL</span>
            <h1>Subject: {currentPrivateResult.targetName}</h1>

            <div className={currentPrivateResult.isMafia ? "investigation-answer danger" : "investigation-answer safe"}>
              {currentPrivateResult.isMafia
                ? "⚠️ GUILTY: This individual belongs to the Mafia syndicate!"
                : "✅ INNOCENT: This individual checks out clean. Not Mafia."}
            </div>

            <p>Commit this secret to memory. Conceal the screen before handing the device back.</p>

            <button className="game-primary" onClick={finishPrivateResult}>
              Got it, hide intelligence 👁️‍🗨️
            </button>
          </section>
        )}

        {/* 4. NIGHT SUMMARY (VIBRANT SUNNY DAYTIME VIEW) */}
        {phase === "night-summary" && (
          <section className="game-layout daytime-layout">
            <span className="game-eyebrow daytime-eyebrow">
              {nightResult?.eliminated?.length > 0 ? "🩸 BLOODY NIGHT" : "☀️ SILENT MORNING"}
            </span>

            <h1 className="daytime-heading">
              {nightResult?.eliminated?.length > 0
                ? "Tragedy struck under the cover of darkness..."
                : "The morning sun breaks over a peaceful town..."}
            </h1>

            {nightResult?.eliminated?.length > 0 ? (
              <div className="elimination-list">
                {nightResult.eliminated.map(player => (
                  <div className="elimination-item daytime-elimination" key={player.id}>
                    <h2>💀 {player.name}</h2>
                    <p>Was found murdered this morning.</p>
                    <strong>Role Revealed: {getRole(player.roleId)?.name}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-elimination daytime-box">
                🕊️ Peaceful dawn! No one was killed last night.
              </div>
            )}

            {/* Explicit Doctor Save Announcement (Only shown if doctor saved the actual targeted player) */}
            {nightResult?.savedPlayerName && (
              <div className="doctor-save-banner daytime-banner">
                🏥 <strong>Miraculous Heal:</strong> The town doctor successfully saved <strong>{nightResult.savedPlayerName}</strong> from a lethal midnight attack!
              </div>
            )}

            <button className="game-primary daytime-btn" onClick={startDiscussionPhase}>
              Start Town Discussion 🗣️
            </button>
          </section>
        )}

        {/* 5. 1:30 MINUTES DISCUSSION TIMER PHASE (VIBRANT DAYTIME) */}
        {phase === "discussion" && (
          <section className="game-layout daytime-layout discussion-phase">
            <span className="game-eyebrow daytime-eyebrow">☕ TOWN HALL MEETING</span>
            <h1 className="daytime-heading">Open Debate & Accusations</h1>
            <p className="daytime-desc">Talk openly, cross-examine alibis, defend your innocence, and expose the hidden Mafia!</p>

            <div className="timer-display-box daytime-timer-box">
              <span className="timer-clock-icon">⏳</span>
              <div className="timer-countdown">{formatTimer(timeLeft)}</div>
              <span className="timer-label">Remaining Discussion Time</span>
            </div>

            <div className="timer-controls">
              <button
                className="timer-toggle-btn daytime-sub-btn"
                onClick={() => setTimerActive(!timerActive)}
              >
                {timerActive ? "⏸️ Pause Timer" : "▶️ Resume Timer"}
              </button>
              <button
                className="timer-add-btn daytime-sub-btn"
                onClick={() => setTimeLeft(prev => prev + 30)}
              >
                ➕ Add 30s
              </button>
            </div>

            <button className="game-primary daytime-btn" onClick={beginVoting}>
              Proceed to Town Vote 🗳️
            </button>
          </section>
        )}

        {/* 6. DAYTIME VOTING HANDOFF */}
        {phase === "vote-handoff" && currentVoter && (
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
              👤 {currentVoter.name}
            </div>

            <div className="turn-counter daytime-counter">
              VOTER {safeVoteIndex + 1} OF {alivePlayers.length}
            </div>

            <button className="game-primary daytime-btn" onClick={revealVote}>
              I am {currentVoter.name} — Cast My Vote 🗳️
            </button>
          </section>
        )}

        {/* 7. PRIVATE DAYTIME VOTING SCREEN */}
        {phase === "vote" && currentVoter && (
          <section className="game-layout daytime-layout voting-phase">
            <span className="game-eyebrow daytime-eyebrow">
              ⚖️ CONFIDENTIAL BALLOT
            </span>

            <h1 className="daytime-heading">
              Who deserves your suspicion?
            </h1>

            <p className="daytime-desc">
              Select the player you believe belongs to the Mafia.
              Your vote will remain confidential.
            </p>

            <div className="voting-instructions">
              <span>🗳️</span>
              <div>
                <strong>Make your decision carefully</strong>
                <p>Once submitted, your ballot cannot be changed.</p>
              </div>
            </div>

            <div className="target-list daytime-target-list">
              {alivePlayers
                .filter(player => player.id !== currentVoter.id)
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
              💤 Abstain — Cast no vote
            </button>

            <ErrorMessage />

            <button
              className="game-primary daytime-btn"
              onClick={submitVote}
            >
              Submit Ballot Confidentially 🔒
            </button>
          </section>
        )}

        {/* 8. VOTING SUMMARY (VIBRANT DAYTIME) */}
        {phase === "vote-summary" && (
          <section className="game-layout daytime-layout">
            <span className="game-eyebrow daytime-eyebrow">⚖️ TOWN JUDGMENT</span>
            <h1 className="daytime-heading">The votes have been tallied.</h1>

            {voteResult?.eliminated ? (
              <div className="elimination-list">
                <div className="elimination-item daytime-elimination">
                  <h2>🔨 {voteResult.eliminated.name}</h2>
                  <p>Has been voted out and permanently exiled by majority town decision.</p>
                  <strong>Role Revealed: {getRole(voteResult.eliminated.roleId)?.name}</strong>
                </div>
              </div>
            ) : (
              <div className="no-elimination daytime-box">
                ⚖️ The vote ended in a deadlock or everyone abstained. No one was banished today!
              </div>
            )}

            <button className="game-primary daytime-btn" onClick={nextRound}>
              Advance to Next Night 🌙
            </button>
          </section>
        )}

        {/* 9. GAME OVER SCREEN (VIBRANT DAYTIME) */}
        {phase === "game-over" && (
          <section className="game-over daytime-layout">
            <div className="winner-icon">{winner === "town" ? "☀️" : "♠️"}</div>
            <span className="game-eyebrow daytime-eyebrow">🏆 GAME CONCLUDED</span>
            <h1 className="daytime-heading">{winner === "town" ? "The Town Triumphed!" : "The Mafia Conquered!"}</h1>
            <p className="daytime-desc">
              {winner === "town"
                ? "All hidden mafia threats have been successfully purged from town."
                : "The criminal syndicate has outnumbered the innocent townspeople."}
            </p>

            <h3>📜 Final Role Ledger</h3>

            <div className="final-players">
              {players.map(player => (
                <div className="final-player" key={player.id}>
                  <span>👤 {player.name}</span>
                  <strong>{getRole(player.roleId)?.name}</strong>
                  <span className={player.alive ? "status-alive" : "status-dead"}>
                    {player.alive ? "🟢 Alive" : "🔴 Eliminated"}
                  </span>
                </div>
              ))}
            </div>

            <button className="game-primary daytime-btn" onClick={onBack}>
              Return to Setup 🏠
            </button>
          </section>
        )}

      </div>
    </main>
  );
}

export default Game;