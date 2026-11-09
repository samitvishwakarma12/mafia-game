
import { useState } from "react";

import Home from "./components/Home";
import Settings from "./components/Settings";
import Rules from "./components/Rules";
import RoleReveal from "./components/RoleReveal";
import Game from "./components/Game";

import { createPlayers } from "./game/roleAssignment";

import "./App.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [gameSettings, setGameSettings] = useState(null);
  const [players, setPlayers] = useState([]);

  const handleStart = () => {
    setScreen("settings");
  };

  const handleContinue = (settings) => {
    setGameSettings(settings);
    setScreen("rules");
  };

  const handleRulesContinue = () => {
    const names =
      gameSettings.identityMode === "anonymous"
        ? Array.from(
            { length: gameSettings.playerCount },
            (_, index) => `Player ${index + 1}`
          )
        : gameSettings.playerNames;

    const assignedPlayers = createPlayers(
      names,
      gameSettings.assignment,
      gameSettings.roles
    );

    setPlayers(assignedPlayers);
    setScreen("reveal");
  };

  const handleRevealComplete = (revealedPlayers) => {
    setPlayers(revealedPlayers);
    setScreen("game");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <Home onStart={handleStart} />
      )}

      {screen === "settings" && (
        <Settings
          onBack={() => setScreen("home")}
          onContinue={handleContinue}
        />
      )}

      {screen === "rules" && (
        <Rules
          onBack={() => setScreen("settings")}
          onContinue={handleRulesContinue}
        />
      )}

      {screen === "reveal" && (
        <RoleReveal
          players={players}
          onBack={() => setScreen("rules")}
          onComplete={handleRevealComplete}
        />
      )}

      {screen === "game" && (
        <Game
          settings={gameSettings}
          initialPlayers={players}
          onBack={() => setScreen("settings")}
        />
      )}
    </div>
  );
}

export default App;