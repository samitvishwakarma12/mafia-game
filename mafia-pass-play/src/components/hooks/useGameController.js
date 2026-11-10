import { useEffect, useState } from "react";
import { getRole } from "../../game/roles";

import {
  getAlivePlayers,
  getEligibleTargets,
  resolveNight,
  resolveVoting,
  getWinner
} from "../../game/gameLogic";

export function useGameController(initialPlayers) {
  const [phase, setPhase] = useState("action-handoff");
  const [players, setPlayers] = useState(initialPlayers ?? []);
  const [round, setRound] = useState(1);

  // Night actions
  const [turnIndex, setTurnIndex] = useState(0);
  const [actions, setActions] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [actionAbstained, setActionAbstained] = useState(false);

  // Night results and private investigation
  const [nightResult, setNightResult] = useState(null);
  const [privateResults, setPrivateResults] = useState([]);
  const [privateIndex, setPrivateIndex] = useState(0);

  // Discussion timer
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);

  // Voting
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [voteResult, setVoteResult] = useState(null);

  // Game result and validation
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState("");

  // Derived game data
  const alivePlayers = getAlivePlayers(players);

  const safeTurnIndex = Math.min(
    turnIndex,
    Math.max(0, alivePlayers.length - 1)
  );

  const currentActionPlayer = alivePlayers[safeTurnIndex];

  const currentRole = currentActionPlayer
    ? getRole(currentActionPlayer.roleId)
    : null;

  const safeVoteIndex = Math.min(
    voteIndex,
    Math.max(0, alivePlayers.length - 1)
  );

  const currentVoter = alivePlayers[safeVoteIndex];
  const currentPrivateResult = privateResults[privateIndex];

  const eligibleTargets = currentActionPlayer
    ? getEligibleTargets(currentActionPlayer, players)
    : [];

  // Discussion timer
  useEffect(() => {
    let interval = null;

    if (phase === "discussion" && timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [phase, timerActive, timeLeft]);

  // Check whether either team has won
  const checkWinner = (updatedPlayers) => {
    const result = getWinner(updatedPlayers);

    if (result) {
      setWinner(result);
      setPhase("game-over");
      return true;
    }

    return false;
  };

  // Reveal the current player's secret night screen
  const revealAction = () => {
    setSelectedTarget("");
    setActionAbstained(false);
    setError("");
    setPhase("action");
  };

  // Resolve all submitted night actions
  const finishNight = (submittedActions) => {
    const result = resolveNight(players, submittedActions);

    setPlayers(result.players);
    setNightResult(result);
    setPrivateResults([]);
    setPrivateIndex(0);

    setPhase("night-summary");
  };

  // Submit a player's night action
  const submitAction = () => {
    if (!currentActionPlayer || !currentRole) return;

    const actionType = currentRole.action?.type ?? "none";

    const canAbstain = [
      "mafiaVote",
      "protect",
      "investigate"
    ].includes(actionType);

    if (
      currentRole.action &&
      !selectedTarget &&
      (!canAbstain || !actionAbstained)
    ) {
      setError(
        "⚠️ Pick someone to  kill or choose the abstain (no kill) option below."
      );
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

      // Show investigation result privately to the police
      if (action.type === "investigate" && action.targetId) {
        const target = players.find(
          player => player.id === action.targetId
        );

        if (target) {
          setPrivateResults([
            {
              playerId: currentActionPlayer.id,
              targetName: target.name,
              isMafia: target.roleId === "mafia"
            }
          ]);

          setPrivateIndex(0);
          setPhase("private-result");
        }
      } else if (safeTurnIndex + 1 < alivePlayers.length) {
        setTurnIndex(safeTurnIndex + 1);
        setPhase("action-handoff");
      } else {
        finishNight(updated);
      }

      return updated;
    });

    setError("");
  };

  // Close the police's private result and continue the night
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

  // Begin the daytime discussion phase
  const startDiscussionPhase = () => {
    if (checkWinner(players)) return;

    setTimeLeft(90);
    setTimerActive(true);
    setPhase("discussion");
  };

  // Begin voting
  const beginVoting = () => {
    setTimerActive(false);
    setVoteIndex(0);
    setVotes([]);
    setSelectedTarget("");
    setError("");
    setPhase("vote-handoff");
  };

  // Reveal the current voter's ballot
  const revealVote = () => {
    setSelectedTarget("");
    setError("");
    setPhase("vote");
  };

  // Resolve all submitted votes
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

  // Submit a player's vote
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

  // Start the next round
  const nextRound = () => {
    if (checkWinner(players)) return;

    setRound(roundNumber => roundNumber + 1);

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

  // Discussion timer controls
  const toggleTimer = () => {
    setTimerActive(active => !active);
  };

  const addTimerTime = () => {
    setTimeLeft(previous => previous + 30);
  };

  return {
    phase,
    players,
    round,
    alivePlayers,

    safeTurnIndex,
    currentActionPlayer,
    currentRole,
    eligibleTargets,

    safeVoteIndex,
    currentVoter,

    currentPrivateResult,

    selectedTarget,
    setSelectedTarget,
    actionAbstained,
    setActionAbstained,

    nightResult,
    timeLeft,
    timerActive,
    voteResult,
    winner,
    error,

    revealAction,
    submitAction,
    finishPrivateResult,
    startDiscussionPhase,

    beginVoting,
    revealVote,
    submitVote,

    nextRound,

    toggleTimer,
    addTimerTime
  };
}