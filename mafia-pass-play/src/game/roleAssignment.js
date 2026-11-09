
import { ROLES } from "./roles";

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getAutomaticRoles(playerCount) {
  const mafiaCount = Math.max(1, Math.floor(playerCount / 4));

  const roleList = [
    ...Array(mafiaCount).fill("mafia"),
    "doctor",
    "detective"
  ];

  const villagerCount = playerCount - roleList.length;

  if (villagerCount < 0) {
    throw new Error("Not enough players for this role configuration.");
  }

  roleList.push(...Array(villagerCount).fill("villager"));

  return roleList;
}

function getManualRoles(playerCount, roleLimits) {
  const counts = {};
  let assigned = 0;

  for (const roleId of Object.keys(ROLES)) {
    const limits = roleLimits[roleId];

    if (!limits) {
      throw new Error(`Missing configuration for ${roleId}.`);
    }

    const { min, max } = limits;

    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      min < 0 ||
      max < min ||
      max > playerCount
    ) {
      throw new Error(`Invalid limits for ${roleId}.`);
    }

    counts[roleId] = min;
    assigned += min;
  }

  if (counts.mafia < 1) {
    throw new Error("At least one Mafia is required.");
  }

  if (assigned > playerCount) {
    throw new Error("Minimum role counts exceed player count.");
  }

  const maximumCapacity = Object.values(roleLimits)
    .reduce((sum, role) => sum + role.max, 0);

  if (maximumCapacity < playerCount) {
    throw new Error("Maximum role counts cannot accommodate everyone.");
  }

  while (assigned < playerCount) {
    const availableRoles = Object.keys(ROLES).filter(
      roleId => counts[roleId] < roleLimits[roleId].max
    );

    if (availableRoles.length === 0) {
      throw new Error("Unable to fill all player positions.");
    }

    const selectedRole = availableRoles[
      Math.floor(Math.random() * availableRoles.length)
    ];

    counts[selectedRole]++;
    assigned++;
  }

  return Object.entries(counts).flatMap(
    ([roleId, count]) => Array(count).fill(roleId)
  );
}

export function assignRoles(playerCount, assignment, roleLimits) {
  if (!Number.isInteger(playerCount) || playerCount < 4) {
    throw new Error("A minimum of four players is required.");
  }

  const roleList = assignment === "manual"
    ? getManualRoles(playerCount, roleLimits)
    : getAutomaticRoles(playerCount);

  return shuffle(roleList);
}

export function createPlayers(names, assignment, roleLimits) {
  const roleList = assignRoles(
    names.length,
    assignment,
    roleLimits
  );

  return names.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    roleId: roleList[index],
    alive: true
  }));
}
