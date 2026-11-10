import { getRole } from "./roles";

export function getAlivePlayers(players) {
  return players.filter(player => player.alive);
}

export function getEligibleTargets(player, players) {
  const role = getRole(player.roleId);

  if (!role?.action) return [];

  return getAlivePlayers(players).filter(target => {
    // Mafia can now target themselves if they choose to commit suicide
    if (target.id === player.id && !role.allowSelf && role.id !== "mafia") {
      return false;
    }

    switch (role.targetRule) {
      case "nonMafia":
        // Mafia can target anyone including themselves now
        return true;

      case "alive":
        return true;

      default:
        return false;
    }
  });
}

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

    // Allow abstentions for mafia, doctor, and police
    if (!action.targetId) {
      if (
        action.type !== "mafiaVote" &&
        action.type !== "protect" &&
        action.type !== "investigate"
      ) {
        return false;
      }

      seenPlayers.add(action.playerId);
      return true;
    }

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

  // A target is truly "saved" ONLY IF the doctor protected the exact target the mafia attacked
  const isAttackBlocked =
    attackTargetId !== null &&
    protectedPlayers.has(attackTargetId);

  const savedPlayerName = isAttackBlocked
    ? (players.find(p => p.id === attackTargetId)?.name ?? null)
    : null;

  const eliminatedIds = [];

  if (attackTargetId && !isAttackBlocked) {
    eliminatedIds.push(attackTargetId);
  }

  // Properly map and eliminate players
  const updatedPlayers = players.map(player => ({
    ...player,
    alive: eliminatedIds.includes(player.id)
      ? false
      : player.alive
  }));

  const eliminated = updatedPlayers.filter(
    player => eliminatedIds.includes(player.id)
  );

  const privateResults = validActions
    .filter(action => action.type === "investigate" && action.targetId)
    .map(action => {
      const target = players.find(
        player => player.id === action.targetId
      );

      return {
        playerId: action.playerId,
        targetName: target ? target.name : "Unknown",
        isMafia: target ? target.roleId === "mafia" : false
      };
    });

  let outcome = "no-mafia-action";

  if (mafiaActions.length > 0 && mafiaVotes.length === 0) {
    outcome = "mafia-abstained";
  } else if (mafiaVotes.length > 0 && !attackTargetId) {
    outcome = "mafia-tied";
  } else if (isAttackBlocked) {
    outcome = "protected";
  } else if (attackTargetId) {
    outcome = "eliminated";
  }

  return {
    players: updatedPlayers,
    eliminated,
    privateResults,
    attackTarget: attackTargetId ? players.find(p => p.id === attackTargetId) : null,
    savedPlayerName,
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

    if (!vote.targetId) {
      seenVoters.add(vote.playerId);
      return true;
    }

    const target = players.find(
      player => player.id === vote.targetId
    );

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