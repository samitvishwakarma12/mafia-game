import "./Home.css";

function Home({ onStart }) {
  return (
    <main className="home">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">♟</span>
          <span>MAFIA<span className="brand-accent">.</span></span>
        </div>

        <div className="nav-tag">
          <span className="online-dot"></span>
          LOCAL PARTY GAME
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            ✦ THE ULTIMATE SOCIAL DEDUCTION GAME
          </div>

          <h1>
            TRUST NO ONE.
            <br />
            <span>EXCEPT YOURSELF.</span>
          </h1>

          <p className="hero-description">
            Secrets, deception, and a little bit of chaos.
            Gather your friends, pass the device around,
            and find out who's lying.
          </p>

          <button className="start-button" onClick={onStart}>
            START GAME <span>→</span>
          </button>

          <p className="start-caption">
            NO LOGIN · NO DOWNLOAD · JUST PLAY
          </p>
        </div>

        <div className="game-preview">
          <div className="preview-top">
            <span>YOUR NIGHT BEGINS</span>
            <span className="preview-dots">● ● ●</span>
          </div>

          <div className="preview-cards">
            <div className="role-card citizen">
              <span className="role-symbol">☀</span>
              <span className="role-name">CITIZEN</span>
              <span className="role-sub">THE INNOCENT</span>
            </div>

            <div className="role-card mafia">
              <span className="role-symbol">♠</span>
              <span className="role-name">MAFIA</span>
              <span className="role-sub">THE ENEMY</span>
            </div>

            <div className="role-card police">
              <span className="role-symbol">⌕</span>
              <span className="role-name">POLICE</span>
              <span className="role-sub">THE SEEKER</span>
            </div>
          </div>

          <div className="preview-bottom">
            <span>EVERYONE HAS A SECRET.</span>
            <span>WHO CAN YOU TRUST?</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>MAFIA. © 2026</span>
        <span>MADE FOR GAME NIGHTS <span className="footer-heart">♥</span></span>
      </footer>
    </main>
  );
}

export default Home;
