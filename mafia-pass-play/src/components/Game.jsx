
import { useState } from "react";
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

  // Night results
  const [nightResult, setNightResult] = useState(null);
  const [privateResults, setPrivateResults] = useState([]);
  const [privateIndex, setPrivateIndex] = useState(0);

  // Voting
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [voteResult, setVoteResult] = useState(null);

  // Game result
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState("");

  const alivePlayers = getAlivePlayers(players);

  const currentActionPlayer = alivePlayers[turnIndex];

  const currentRole = currentActionPlayer
    ? getRole(currentActionPlayer.roleId)
    : null;

  const currentVoter = alivePlayers[voteIndex];

  const currentPrivateResult = privateResults[privateIndex];

  const eligibleTargets = currentActionPlayer
    ? getEligibleTargets(currentActionPlayer, players)
    : [];

  // ---------------------------
  // WIN CONDITION CHECK
  // ---------------------------

  const checkWinner = (updatedPlayers) => {
    const result = getWinner(updatedPlayers);

    if (result) {
      setWinner(result);
      setPhase("game-over");
      return true;
    }

    return false;
  };

  // ---------------------------
  // NIGHT ACTIONS
  // ---------------------------

  const revealAction = () => {
    setSelectedTarget("");
    setActionAbstained(false);
    setError("");
    setPhase("action");
  };

  const submitAction = () => {
    if (!currentActionPlayer || !currentRole) return;

    const actionType = currentRole.action?.type ?? "none";

    const canAbstain =
      actionType === "mafiaVote" ||
      actionType === "protect";

    if (
      currentRole.action &&
      !selectedTarget &&
      (!canAbstain || !actionAbstained)
    ) {
      setError("Please select a target or explicitly abstain.");
      return;
    }

    // Make sure the selected target is still eligible.
    if (
      selectedTarget &&
      !eligibleTargets.some(
        target => target.id === selectedTarget
      )
    ) {
      setError("That player is no longer a valid target.");
      return;
    }

    const action = {
      playerId: currentActionPlayer.id,
      type: actionType,
      targetId: selectedTarget || null
    };

    const updatedActions = [...actions, action];

    setActions(updatedActions);
    setError("");

    // Detective receives their result immediately.
    // No public announcement or handoff is shown.
    if (action.type === "investigate") {
      const target = players.find(
        player => player.id === action.targetId
      );

      if (!target) {
        setError("Investigation target could not be found.");
        return;
      }

      setPrivateResults([
        {
          playerId: currentActionPlayer.id,
          targetName: target.name,
          isMafia: target.roleId === "mafia"
        }
      ]);

      setPrivateIndex(0);
      setPhase("private-result");
      return;
    }

    // Continue to the next living player's turn.
    if (turnIndex + 1 < alivePlayers.length) {
      setTurnIndex(index => index + 1);
      setPhase("action-handoff");
      return;
    }

    // All night actions have been submitted.
    finishNight(updatedActions);
  };

  const finishNight = (submittedActions) => {
    const result = resolveNight(players, submittedActions);

    setPlayers(result.players);
    setNightResult(result);

    // Investigation results have already been delivered.
    setPrivateResults([]);
    setPrivateIndex(0);

    setPhase("night-summary");
  };

  // ---------------------------
  // DETECTIVE PRIVATE RESULT
  // ---------------------------

  const finishPrivateResult = () => {
    setPrivateResults([]);
    setPrivateIndex(0);

    // Pass the device to the next player.
    if (turnIndex + 1 < alivePlayers.length) {
      setTurnIndex(index => index + 1);
      setPhase("action-handoff");
      return;
    }

    // The Detective was the last player to act.
    // The actions state already contains their investigation.
    finishNight(actions);
  };

  // ---------------------------
  // DAYTIME VOTING
  // ---------------------------

  const beginVoting = () => {
    if (checkWinner(players)) return;

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

    const updatedVotes = [...votes, vote];

    setVotes(updatedVotes);
    setError("");

    if (voteIndex + 1 < alivePlayers.length) {
      setVoteIndex(index => index + 1);
      setPhase("vote-handoff");
      return;
    }

    finishVoting(updatedVotes);
  };

  const finishVoting = (submittedVotes) => {
    const result = resolveVoting(players, submittedVotes);

    setPlayers(result.players);
    setVoteResult(result);

    // Check for victory immediately after elimination.
    const gameWinner = getWinner(result.players);

    if (gameWinner) {
      setWinner(gameWinner);
      setPhase("game-over");
      return;
    }

    setPhase("vote-summary");
  };

  // ---------------------------
  // NEXT ROUND
  // ---------------------------

  const nextRound = () => {
    if (checkWinner(players)) return;

    setRound(currentRound => currentRound + 1);

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

  // ---------------------------
  // GAME HEADER
  // ---------------------------

  const GameHeader = () => (
    <header className="game-navbar">
      <div className="game-round">
        ROUND {round}
      </div>

      <div className="game-status">
        {alivePlayers.length} players remaining
      </div>
    </header>
  );

  const ErrorMessage = () => (
    error ? (
      <div className="game-error">
        {error}
      </div>
    ) : null
  );

  // ---------------------------
  // SCREEN CONTENT
  // ---------------------------

  return (
    <main className="game-page">
      <GameHeader />

      <div className="game-container">

        {/* NIGHT ACTION HANDOFF */}
        {phase === "action-handoff" && currentActionPlayer && (
          <section className="handoff-card">
            <span className="game-eyebrow">
              NIGHT {round}
            </span>

            <h1>Pass the device.</h1>

            <div className="handoff-player">
              {currentActionPlayer.name}
            </div>

            <p>
              Make sure nobody else can see the screen.
              Tap below when you're ready.
            </p>

            <div className="turn-counter">
              Player {turnIndex + 1} of {alivePlayers.length}
            </div>

            <button
              className="game-primary"
              onClick={revealAction}
            >
              I'm ready
            </button>
          </section>
        )}

        {/* PRIVATE NIGHT ACTION */}
        {phase === "action" && currentActionPlayer && currentRole && (
          <section className="action-card">
            <span className="game-eyebrow">
              YOUR TURN
            </span>

            <div className={`role-display ${currentRole.team}`}>
              <div className="role-display-icon">
                {currentRole.icon ?? "?"}
              </div>

              <span>
                {currentRole.team.toUpperCase()}
              </span>

              <h1>{currentRole.name}</h1>

              <p>{currentRole.description}</p>
            </div>

            {currentRole.team === "mafia" && (
              <div className="teammates">
                <strong>Your Mafia teammates</strong>

                <p>
                  {players
                    .filter(
                      player =>
                        player.roleId === "mafia" &&
                        player.id !== currentActionPlayer.id &&
                        player.alive
                    )
                    .map(player => player.name)
                    .join(", ") || "You are the only Mafia member."}
                </p>
              </div>
            )}

            {currentRole.action && (
              <>
                <h3>{currentRole.action.label}</h3>

                <p>{currentRole.action.description}</p>

                <div className="target-list">
                  {eligibleTargets.map(target => (
                    <button
                      key={target.id}
                      className={
                        selectedTarget === target.id
                          ? "target-option selected"
                          : "target-option"
                      }
                      onClick={() => {
                        setSelectedTarget(target.id);
                        setActionAbstained(false);
                      }}
                    >
                      {target.name}
                    </button>
                  ))}
                </div>

                {/* MAFIA ABSTENTION */}
                {currentRole.action.type === "mafiaVote" && (
                  <button
                    className={
                      actionAbstained
                        ? "target-option abstain selected"
                        : "target-option abstain"
                    }
                    onClick={() => {
                      setSelectedTarget("");
                      setActionAbstained(true);
                    }}
                  >
                    Abstain — no attack tonight
                  </button>
                )}

                {/* DOCTOR ABSTENTION */}
                {currentRole.action.type === "protect" && (
                  <button
                    className={
                      actionAbstained
                        ? "target-option abstain selected"
                        : "target-option abstain"
                    }
                    onClick={() => {
                      setSelectedTarget("");
                      setActionAbstained(true);
                    }}
                  >
                    Skip healing tonight
                  </button>
                )}
              </>
            )}

            {!currentRole.action && (
              <div className="no-elimination">
                You have no special night action.
                Wait for the next day to discuss and vote.
              </div>
            )}

            <ErrorMessage />

            <button
              className="game-primary"
              onClick={submitAction}
            >
              Confirm and hide role
            </button>
          </section>
        )}

        {/* DETECTIVE PRIVATE RESULT */}
        {phase === "private-result" && currentPrivateResult && (
          <section className="private-result">
            <span className="game-eyebrow">
              PRIVATE INVESTIGATION RESULT
            </span>

            <h1>{currentPrivateResult.targetName}</h1>

            <div
              className={
                currentPrivateResult.isMafia
                  ? "investigation-answer danger"
                  : "investigation-answer safe"
              }
            >
              {currentPrivateResult.isMafia
                ? "This player is Mafia."
                : "This player is not Mafia."}
            </div>

            <p>
              Keep this information secret. Hide the result
              before passing the device.
            </p>

            <button
              className="game-primary"
              onClick={finishPrivateResult}
            >
              Hide result and continue
            </button>
          </section>
        )}

        {/* NIGHT SUMMARY */}
        {phase === "night-summary" && (
          <section className="game-layout">
            <span className="game-eyebrow">
              NIGHT {round} RESULTS
            </span>

            <h1>The night is over.</h1>

            {nightResult?.eliminated?.length > 0 ? (
              <div className="elimination-list">
                {nightResult.eliminated.map(player => (
                  <div
                    className="elimination-item"
                    key={player.id}
                  >
                    <h2>{player.name}</h2>

                    <p>
                      Was eliminated during the night.
                    </p>

                    <strong>
                      Role: {getRole(player.roleId)?.name}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-elimination">
                Nobody was eliminated last night.
              </div>
            )}

            <button
              className="game-primary"
              onClick={beginVoting}
            >
              Begin the day
            </button>
          </section>
        )}

        {/* VOTING HANDOFF */}
        {phase === "vote-handoff" && currentVoter && (
          <section className="handoff-card">
            <span className="game-eyebrow">
              DAY {round} · VOTING
            </span>

            <h1>Pass the device.</h1>

            <div className="handoff-player">
              {currentVoter.name}
            </div>

            <p>
              It is your turn to cast a private vote.
              Don't let anyone else see your choice.
            </p>

            <div className="turn-counter">
              Player {voteIndex + 1} of {alivePlayers.length}
            </div>

            <button
              className="game-primary"
              onClick={revealVote}
            >
              I'm ready
            </button>
          </section>
        )}

        {/* PRIVATE VOTE */}
        {phase === "vote" && currentVoter && (
          <section className="action-card">
            <span className="game-eyebrow">
              CAST YOUR VOTE
            </span>

            <h1>Who do you suspect?</h1>

            <p>Your vote is private.</p>

            <div className="target-list">
              {alivePlayers
                .filter(player => player.id !== currentVoter.id)
                .map(player => (
                  <button
                    key={player.id}
                    className={
                      selectedTarget === player.id
                        ? "target-option selected"
                        : "target-option"
                    }
                    onClick={() => setSelectedTarget(player.id)}
                  >
                    {player.name}
                  </button>
                ))}
            </div>

            <button
              className={
                selectedTarget === ""
                  ? "target-option abstain selected"
                  : "target-option abstain"
              }
              onClick={() => setSelectedTarget("")}
            >
              Abstain
            </button>

            <ErrorMessage />

            <button
              className="game-primary"
              onClick={submitVote}
            >
              Submit private vote
            </button>
          </section>
        )}

        {/* VOTING RESULTS */}
        {phase === "vote-summary" && (
          <section className="game-layout">
            <span className="game-eyebrow">
              DAY {round} RESULTS
            </span>

            <h1>The votes are in.</h1>

            {voteResult?.eliminated ? (
              <div className="elimination-list">
                <div className="elimination-item">
                  <h2>{voteResult.eliminated.name}</h2>

                  <p>
                    Has been eliminated by the town.
                  </p>

                  <strong>
                    Role: {getRole(voteResult.eliminated.roleId)?.name}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="no-elimination">
                The vote ended in a tie or everyone abstained.
                Nobody was eliminated.
              </div>
            )}

            <button
              className="game-primary"
              onClick={nextRound}
            >
              Continue to next night
            </button>
          </section>
        )}

        {/* GAME OVER */}
        {phase === "game-over" && (
          <section className="game-over">
            <div className="winner-icon">
              {winner === "town" ? "☀" : "♠"}
            </div>

            <span className="game-eyebrow">
              GAME OVER
            </span>

            <h1>
              {winner === "town"
                ? "The Town wins!"
                : "The Mafia wins!"}
            </h1>

            <p>
              {winner === "town"
                ? "All Mafia members have been eliminated."
                : "The Mafia has reached parity with the Town."}
            </p>

            <h3>Final roles</h3>

            <div className="final-players">
              {players.map(player => (
                <div className="final-player" key={player.id}>
                  <span>{player.name}</span>

                  <strong>
                    {getRole(player.roleId)?.name}
                  </strong>

                  <span>
                    {player.alive ? "Alive" : "Eliminated"}
                  </span>
                </div>
              ))}
            </div>

            <button
              className="game-primary"
              onClick={onBack}
            >
              Return to settings
            </button>
          </section>
        )}

      </div>
    </main>
  );
}

export default Game;
