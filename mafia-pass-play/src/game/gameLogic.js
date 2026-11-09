
import { getRole } from "./roles";

export function getAlivePlayers(players) {
  return players.filter(player => player.alive);
}

export function getEligibleTargets(player, players) {
  const role = getRole(player.roleId);

  if (!role?.action) return [];

  return getAlivePlayers(players).filter(target => {
    if (target.id === player.id && !role.allowSelf) {
      return false;
    }

    switch (role.targetRule) {
      case "nonMafia":
        return target.roleId !== "mafia";

      case "alive":
        return true;

      default:
        return false;
    }
  });
}

// Returns the player receiving the most votes.
// Returns null if nobody received votes or there is a tie.
function getPluralityTarget(votes) {
  const counts = {};

  votes.forEach(vote => {
    if (!vote.targetId) return;

    counts[vote.targetId] =
      (counts[vote.targetId] || 0) + 1;
  });

  const entries = Object.entries(counts);

  if (entries.length === 0) return null;

  const highest = Math.max(
    ...entries.map(([, count]) => count)
  );

  const winners = entries.filter(
    ([, count]) => count === highest
  );

  if (winners.length !== 1) return null;

  return winners[0][0];
}

// NIGHT RESOLUTION

export function resolveNight(players, actions) {
  const protectedPlayers = new Set();

  // Validate actions: only living players can act,
  // and each action must match that player's role.
  const seenPlayers = new Set();

  const validActions = actions.filter(action => {
    if (!action?.playerId || seenPlayers.has(action.playerId)) {
      return false;
    }

    const player = players.find(
      item => item.id === action.playerId
    );

    if (!player?.alive) return false;

    const role = getRole(player.roleId);

    if (!role?.action || role.action.type !== action.type) {
      return false;
    }

    // Mafia and Doctor may explicitly abstain.
    if (!action.targetId) {
      if (
        action.type !== "mafiaVote" &&
        action.type !== "protect"
      ) {
        return false;
      }

      seenPlayers.add(action.playerId);
      return true;
    }

    // Validate that the selected target is eligible.
    const eligibleTargets = getEligibleTargets(
      player,
      players
    );

    const targetIsEligible = eligibleTargets.some(
      target => target.id === action.targetId
    );

    if (!targetIsEligible) return false;

    seenPlayers.add(action.playerId);
    return true;
  });

  // Apply Doctor protection.
  const protectionActions = validActions.filter(
    action => action.type === "protect"
  );

  protectionActions.forEach(action => {
    if (action.targetId) {
      protectedPlayers.add(action.targetId);
    }
  });

  // Resolve Mafia votes.
  const mafiaActions = validActions.filter(
    action => action.type === "mafiaVote"
  );

  const mafiaVotes = mafiaActions.filter(
    action => action.targetId
  );

  const attackTargetId = getPluralityTarget(mafiaActions);

  const attackTarget = attackTargetId
    ? players.find(player => player.id === attackTargetId)
    : null;

  // A protected target survives the attack.
  const attackBlocked =
    attackTargetId !== null &&
    protectedPlayers.has(attackTargetId);

  const eliminatedIds = [];

  if (attackTargetId && !attackBlocked) {
    eliminatedIds.push(attackTargetId);
  }

  const updatedPlayers = players.map(player => ({
    ...player,
    alive: eliminatedIds.includes(player.id)
      ? false
      : player.alive
  }));

  const eliminated = updatedPlayers.filter(
    player => eliminatedIds.includes(player.id)
  );

  // Keep investigation results available to callers,
  // although the UI now displays them immediately.
  const privateResults = validActions
    .filter(action => action.type === "investigate")
    .map(action => {
      const target = players.find(
        player => player.id === action.targetId
      );

      return {
        playerId: action.playerId,
        targetName: target.name,
        isMafia: target.roleId === "mafia"
      };
    });

  // Determine why nobody was eliminated, for internal use.
  let outcome = "no-mafia-action";

  if (mafiaActions.length > 0 && mafiaVotes.length === 0) {
    outcome = "mafia-abstained";
  } else if (mafiaVotes.length > 0 && !attackTargetId) {
    outcome = "mafia-tied";
  } else if (attackBlocked) {
    outcome = "protected";
  } else if (attackTargetId) {
    outcome = "eliminated";
  }

  return {
    players: updatedPlayers,
    eliminated,
    privateResults,
    attackTarget,
    protectedPlayerIds: [...protectedPlayers],
    outcome
  };
}

// DAYTIME VOTING

export function resolveVoting(players, votes) {
  const seenVoters = new Set();

  const validVotes = votes.filter(vote => {
    if (!vote?.playerId || seenVoters.has(vote.playerId)) {
      return false;
    }

    const voter = players.find(
      player => player.id === vote.playerId
    );

    if (!voter?.alive) return false;

    // Abstentions are valid votes.
    if (!vote.targetId) {
      seenVoters.add(vote.playerId);
      return true;
    }

    const target = players.find(
      player => player.id === vote.targetId
    );

    // A player cannot vote for themselves or a dead player.
    if (!target?.alive || target.id === voter.id) {
      return false;
    }

    seenVoters.add(vote.playerId);
    return true;
  });

  const eliminatedId = getPluralityTarget(validVotes);

  const updatedPlayers = players.map(player => ({
    ...player,
    alive: player.id === eliminatedId
      ? false
      : player.alive
  }));

  const eliminated = updatedPlayers.find(
    player => player.id === eliminatedId
  ) ?? null;

  return {
    players: updatedPlayers,
    eliminated,
    votes: validVotes
  };
}

// WIN CONDITIONS

export function getWinner(players) {
  const alive = getAlivePlayers(players);

  const mafiaCount = alive.filter(
    player => getRole(player.roleId)?.team === "mafia"
  ).length;

  const townCount = alive.length - mafiaCount;

  if (mafiaCount === 0) {
    return "town";
  }

  if (mafiaCount >= townCount) {
    return "mafia";
  }

  return null;
}
