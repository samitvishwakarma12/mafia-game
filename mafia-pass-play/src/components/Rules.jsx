
import "./Rules.css";

const rules = [
  {
    icon: "🔇",
    title: "Silence during the night",
    description:
      "Do not speak, make noises, or give hints while it is nighttime."
  },
  {
    icon: "🤫",
    title: "Keep your role secret",
    description:
      "Never reveal your role or let another player see your private information."
  },
  {
    icon: "📱",
    title: "Respect the handoff",
    description:
      "Pass the device only when instructed. The next player must not look at the previous player's screen."
  },
  {
    icon: "💬",
    title: "Speak only during the day",
    description:
      "Discussion, accusations, and defense are allowed during the day. Nighttime is strictly silent."
  },
  {
    icon: "👻",
    title: "Eliminated players are spectators",
    description:
      "Once eliminated, you cannot participate in discussions, voting, or night actions."
  },
  {
    icon: "🛡️",
    title: "No peeking or cheating",
    description:
      "Do not look at another player's actions, interfere with their choices, or deliberately reveal private information."
  }
];

function Rules({ onContinue, onBack }) {
  return (
    <main className="rules-page">
      <div className="rules-container">
        <button className="rules-back" onClick={onBack}>
          ← Back
        </button>

        <div className="rules-heading">
          <span className="rules-eyebrow">BEFORE THE GAME</span>
          <h1>Know the rules.</h1>
          <p>
            A few simple rules to keep the game fair and enjoyable
            for everyone.
          </p>
        </div>

        <div className="rules-list">
          {rules.map((rule, index) => (
            <article className="rule-card" key={rule.title}>
              <div className="rule-icon">{rule.icon}</div>

              <div className="rule-content">
                <span className="rule-number">
                  RULE {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{rule.title}</h3>
                <p>{rule.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="rules-footer">
          <p>Make sure everyone has read these rules.</p>
          <button className="rules-continue" onClick={onContinue}>
            Everyone is ready →
          </button>
        </div>
      </div>
    </main>
  );
}

export default Rules;
