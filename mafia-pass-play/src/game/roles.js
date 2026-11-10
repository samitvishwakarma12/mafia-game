
export const ROLES = {
  mafia: {
    id: "mafia",
    name: "Mafia",
    icon: "♠",
    team: "mafia",
    description: "Work with the Mafia to eliminate the Town.",
    action: {
      type: "mafiaVote",
      label: "Choose a target",
      description: "Vote for someone to eliminate, or abstain tonight."
    },
    targetRule: "nonMafia",
    allowSelf: false
  },

  doctor: {
    id: "doctor",
    name: "Doctor",
    icon: "✚",
    team: "town",
    description: "Protect someone from the Mafia's attack.",
    action: {
      type: "protect",
      label: "Choose someone to protect",
      description: "Your protection can prevent an attack. You may also skip healing."
    },
    targetRule: "alive",
    allowSelf: true
  },

  police: {
    id: "police",
    name: "Police",
    icon: "⌕",
    team: "town",
    description: "Investigate someone to discover their allegiance.",
    action: {
      type: "investigate",
      label: "Choose someone to investigate",
      description: "Discover whether your target belongs to the Mafia."
    },
    targetRule: "alive",
    allowSelf: false
  },

  villager: {
    id: "villager",
    name: "Villager",
    icon: "☀",
    team: "town",
    description: "You have no special night ability. Find the Mafia through discussion and voting.",
    action: null,
    targetRule: null,
    allowSelf: false
  }
};

export function getRole(roleId) {
  return ROLES[roleId] ?? null;
}
