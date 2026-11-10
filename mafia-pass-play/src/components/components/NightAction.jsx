import ErrorMessage from "./ErrorMessage";

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

  return (
    <section className="action-card">
      <span className="game-eyebrow">
        🔐 KEEP YOUR ROLES SECRET
      </span>

      <div className={`role-display ${role.team}`}>
        <div className="role-display-icon">
          {role.icon ?? "❓"}
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