import ErrorMessage from "./ErrorMessage";

import doctorPersonified from "../../assets/role-icons/doctor-personified.svg";
import mafiaPersonified from "../../assets/role-icons/mafia-personified.svg";
import policePersonified from "../../assets/role-icons/police-personified.svg";
import villagerPersonified from "../../assets/role-icons/villager-personified.svg";

import doctorSymbol from "../../assets/role-icons/doctor-symbol.svg";
import mafiaSymbol from "../../assets/role-icons/mafia-symbol.svg";
import policeSymbol from "../../assets/role-icons/police-symbol.svg";
import villagerSymbol from "../../assets/role-icons/villager-symbol.svg";

const ROLE_ASSETS = {
  mafia: { personified: mafiaPersonified, symbol: mafiaSymbol },
  doctor: { personified: doctorPersonified, symbol: doctorSymbol },
  police: { personified: policePersonified, symbol: policeSymbol },
  villager: { personified: villagerPersonified, symbol: villagerSymbol }
};

export default function NightAction({
  player,
  role,
  players,
  eligibleTargets,
  selectedTarget,
  setSelectedTarget,
  actionAbstained,
  setActionAbstained,
  error,
  onSubmit
}) {
  if (!player || !role) return null;

  const abstainLabels = {
    mafiaVote: "Don't Kill Anyone",
    protect: "Don't heal anyone",
    investigate: "Don't investigate anyone"
  };

  const canAbstain = Boolean(
    abstainLabels[role.action?.type]
  );

  const selectAbstain = () => {
    setSelectedTarget("");
    setActionAbstained(true);
  };

  const assets = ROLE_ASSETS[role.id] || {};

  return (
    <section className="action-card">
      <span className="game-eyebrow">
        🔐 KEEP YOUR ROLES SECRET
      </span>

      <div className={`role-display ${role.team}`}>
        <div className="role-display-icon">
          {assets.personified ? (
            <img
              src={assets.personified}
              alt={role.name}
              className="role-svg-portrait-action"
            />
          ) : (
            role.icon ?? "❓"
          )}
        </div>
        <span>{role.team.toUpperCase()} ALLIANCE</span>
        <h1>{role.name}</h1>
        <p>{role.description}</p>
      </div>

      {role.team === "mafia" && (
        <div className="teammates">
          <strong>👥 Your Mafia Team:</strong>
          <p>
            {players
              .filter(
                p => p.roleId === "mafia" && p.id !== player.id && p.alive
              )
              .map(p => p.name)
              .join(", ") || "You are the only mafia member."}
          </p>
        </div>
      )}

      {role.action && (
        <>
          <h3>🎯 {role.action.label}</h3>
          <p>{role.action.description}</p>

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
                👤 {target.name}
                {target.id === player.id ? " (Self)" : ""}
              </button>
            ))}
          </div>

          {canAbstain && (
            <button
              className={
                actionAbstained
                  ? "target-option abstain selected"
                  : "target-option abstain"
              }
              onClick={selectAbstain}
            >
              {abstainLabels[role.action.type]}
            </button>
          )}
        </>
      )}

      {!role.action && (
        <div className="no-elimination">
          🌟 You have no midnight duties. Rest peacefully until morning.
        </div>
      )}

      <ErrorMessage error={error} />

      <button className="game-primary" onClick={onSubmit}>
        Confirm & Hide Role 🙈
      </button>
    </section>
  );
}