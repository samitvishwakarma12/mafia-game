
import { useState } from "react";
import "./Settings.css";

const ROLE_CONFIG = [
  { id: "mafia", name: "Mafia", min: 1 },
  { id: "doctor", name: "Doctor", min: 0 },
  { id: "police", name: "police", min: 0 },
  { id: "villager", name: "Villager", min: 0 }
];

function Settings({ onBack, onContinue }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [assignment, setAssignment] = useState("automatic");

  const [identityMode, setIdentityMode] = useState("named");
  const [namesExpanded, setNamesExpanded] = useState(false);

  const [playerNames, setPlayerNames] = useState(
    Array.from({ length: 4 }, (_, i) => `Player ${i + 1}`)
  );

  const [roles, setRoles] = useState(() => ({
    mafia: { min: 1, max: 2 },
    doctor: { min: 0, max: 1 },
    police: { min: 0, max: 1 },
    villager: { min: 0, max: 4 }
  }));

  const [error, setError] = useState("");

  const handlePlayerCountChange = (event) => {
    const count = Math.max(4, Number(event.target.value) || 4);

    setPlayerCount(count);

    setPlayerNames((currentNames) =>
      Array.from(
        { length: count },
        (_, index) => currentNames[index] ?? `Player ${index + 1}`
      )
    );

    setRoles((currentRoles) => ({
      ...currentRoles,
      villager: {
        ...currentRoles.villager,
        max: Math.max(currentRoles.villager.max, count)
      }
    }));

    setError("");
  };

  const handleNameChange = (index, value) => {
    setPlayerNames((currentNames) =>
      currentNames.map((name, i) =>
        i === index ? value : name
      )
    );
  };

  const handleRoleLimitChange = (roleId, field, value) => {
    const number = Math.max(0, Number(value) || 0);

    setRoles((currentRoles) => ({
      ...currentRoles,
      [roleId]: {
        ...currentRoles[roleId],
        [field]: number
      }
    }));

    setError("");
  };

  const handleContinue = () => {
    if (playerCount < 4) {
      setError("At least 4 players are required.");
      return;
    }

    if (identityMode === "named") {
      const cleanedNames = playerNames.map((name) => name.trim());

      if (cleanedNames.some((name) => !name)) {
        setError("Please enter a name for every player.");
        return;
      }

      if (new Set(cleanedNames.map((name) => name.toLowerCase())).size !== cleanedNames.length) {
        setError("Every player must have a unique name.");
        return;
      }
    }

    if (assignment === "manual") {
      for (const role of ROLE_CONFIG) {
        const limits = roles[role.id];

        if (
          !Number.isInteger(limits.min) ||
          !Number.isInteger(limits.max) ||
          limits.min < 0 ||
          limits.max < limits.min
        ) {
          setError(`Invalid limits for ${role.name}.`);
          return;
        }
      }

      if (roles.mafia.min < 1) {
        setError("At least one Mafia member is required.");
        return;
      }

      const minimumTotal = ROLE_CONFIG.reduce(
        (total, role) => total + roles[role.id].min,
        0
      );

      const maximumTotal = ROLE_CONFIG.reduce(
        (total, role) => total + roles[role.id].max,
        0
      );

      if (minimumTotal > playerCount) {
        setError("The minimum role counts exceed the player count.");
        return;
      }

      if (maximumTotal < playerCount) {
        setError("The maximum role counts cannot fill all player slots.");
        return;
      }
    }

    onContinue({
      playerCount,
      assignment,
      roles,
      identityMode,
      playerNames: playerNames.map((name, index) =>
        name.trim() || `Player ${index + 1}`
      )
    });
  };

  return (
    <main className="settings-page">
      <div className="settings-container">
        <button className="settings-back" onClick={onBack}>
          ← Back
        </button>

        <div className="settings-heading">
          <span className="settings-eyebrow">NEW GAME</span>
          <h1>Game setup</h1>
          <p>Configure your game before everyone joins in.</p>
        </div>

        {/* Player count */}
        <section className="settings-section">
          <h3>Number of players</h3>
          <p>How many people are playing?</p>

          <input
            type="number"
            min="4"
            value={playerCount}
            onChange={handlePlayerCountChange}
          />
        </section>

        {/* Player identity */}
        <section className="settings-section identity-section">
          <h3>Player identity</h3>
          <p>Choose how players will be identified.</p>

          <div className="identity-options">
            <button
              type="button"
              className={
                identityMode === "named"
                  ? "identity-option active"
                  : "identity-option"
              }
              onClick={() => setIdentityMode("named")}
            >
              Use names
            </button>

            <button
              type="button"
              className={
                identityMode === "anonymous"
                  ? "identity-option active"
                  : "identity-option"
              }
              onClick={() => setIdentityMode("anonymous")}
            >
              Anonymous
            </button>
          </div>

          {identityMode === "named" && (
            <div className="player-names-section">
              <button
                type="button"
                className="names-toggle"
                onClick={() => setNamesExpanded((expanded) => !expanded)}
              >
                <span>Player names ({playerCount})</span>
                <span>
                  {namesExpanded ? "▲ Hide" : "▼ Edit names"}
                </span>
              </button>

              {namesExpanded && (
                <div className="player-name-fields">
                  {playerNames.map((name, index) => (
                    <label className="player-name-field" key={index}>
                      <span>Player {index + 1}</span>

                      <input
                        type="text"
                        value={name}
                        maxLength={24}
                        placeholder={`Player ${index + 1}`}
                        onChange={(event) =>
                          handleNameChange(index, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Role assignment */}
        <section className="settings-section">
          <h3>Role assignment</h3>
          <p>Choose how roles will be distributed.</p>

          <div className="assignment-options">
            <button
              type="button"
              className={
                assignment === "automatic"
                  ? "assignment-option active"
                  : "assignment-option"
              }
              onClick={() => setAssignment("automatic")}
            >
              <strong>Automatic</strong>
              <span>Let the game distribute roles.</span>
            </button>

            <button
              type="button"
              className={
                assignment === "manual"
                  ? "assignment-option active"
                  : "assignment-option"
              }
              onClick={() => setAssignment("manual")}
            >
              <strong>Manual</strong>
              <span>Configure role count limits.</span>
            </button>
          </div>

          {assignment === "manual" && (
            <div className="role-limits">
              <p>Set the minimum and maximum number of each role.</p>

              {ROLE_CONFIG.map((role) => (
                <div className="role-limit-row" key={role.id}>
                  <strong>{role.name}</strong>

                  <label>
                    Min
                    <input
                      type="number"
                      min="0"
                      value={roles[role.id].min}
                      onChange={(event) =>
                        handleRoleLimitChange(
                          role.id,
                          "min",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Max
                    <input
                      type="number"
                      min="0"
                      value={roles[role.id].max}
                      onChange={(event) =>
                        handleRoleLimitChange(
                          role.id,
                          "max",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && (
          <div className="settings-error">
            {error}
          </div>
        )}

        <button
          className="settings-continue"
          onClick={handleContinue}
        >
          Continue →
        </button>
      </div>
    </main>
  );
}

export default Settings;
