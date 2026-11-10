import "./Game.css";
import { useGameController } from "./hooks/useGameController";

import GameHeader from "./components/GameHeader";
import ActionHandoff from "./components/ActionHandoff";
import NightAction from "./components/NightAction";
import PrivateResult from "./components/PrivateResult";
import NightSummary from "./components/NightSummary";
import Discussion from "./components/Discussion";
import VoteHandoff from "./components/VoteHandoff";
import Voting from "./components/Voting";
import VoteSummary from "./components/VoteSummary";
import GameOver from "./components/GameOver";

function Game({ settings, initialPlayers, onBack }) {
  const game = useGameController(initialPlayers);

  const isDaytimePhase = [
    "night-summary",
    "discussion",
    "vote-handoff",
    "vote",
    "vote-summary",
    "game-over"
  ].includes(game.phase);

  let phaseContent = null;

  switch (game.phase) {
    case "action-handoff":
      phaseContent = (
        <ActionHandoff
          player={game.currentActionPlayer}
          turnIndex={game.safeTurnIndex}
          playerCount={game.alivePlayers.length}
          onReveal={game.revealAction}
        />
      );
      break;

    case "action":
      phaseContent = (
        <NightAction
          player={game.currentActionPlayer}
          role={game.currentRole}
          players={game.players}
          eligibleTargets={game.eligibleTargets}
          selectedTarget={game.selectedTarget}
          setSelectedTarget={game.setSelectedTarget}
          actionAbstained={game.actionAbstained}
          setActionAbstained={game.setActionAbstained}
          error={game.error}
          onSubmit={game.submitAction}
        />
      );
      break;

    case "private-result":
      phaseContent = (
        <PrivateResult
          result={game.currentPrivateResult}
          onContinue={game.finishPrivateResult}
        />
      );
      break;

    case "night-summary":
      phaseContent = (
        <NightSummary
          nightResult={game.nightResult}
          aliveCount={game.alivePlayers.length}
          onContinue={game.startDiscussionPhase}
        />
      );
      break;

    case "discussion":
      phaseContent = (
        <Discussion
          timeLeft={game.timeLeft}
          timerActive={game.timerActive}
          onToggleTimer={game.toggleTimer}
          onAddTime={game.addTimerTime}
          onBeginVoting={game.beginVoting}
        />
      );
      break;

    case "vote-handoff":
      phaseContent = (
        <VoteHandoff
          voter={game.currentVoter}
          voteIndex={game.safeVoteIndex}
          playerCount={game.alivePlayers.length}
          onReveal={game.revealVote}
        />
      );
      break;

    case "vote":
      phaseContent = (
        <Voting
          alivePlayers={game.alivePlayers}
          voter={game.currentVoter}
          selectedTarget={game.selectedTarget}
          setSelectedTarget={game.setSelectedTarget}
          error={game.error}
          onSubmit={game.submitVote}
        />
      );
      break;

    case "vote-summary":
      phaseContent = (
        <VoteSummary
          voteResult={game.voteResult}
          aliveCount={game.alivePlayers.length}
          onNextRound={game.nextRound}
        />
      );
      break;

    case "game-over":
      phaseContent = (
        <GameOver
          winner={game.winner}
          players={game.players}
          onBack={onBack}
        />
      );
      break;

    default:
      phaseContent = null;
  }

  return (
    <main className={isDaytimePhase ? "game-page daytime-page-bg" : "game-page"}>
      <GameHeader
        isDaytimePhase={isDaytimePhase}
        round={game.round}
        aliveCount={game.alivePlayers.length}
      />

      <div className="game-container">
        <div key={game.phase} className="game-phase-screen">
          {phaseContent}
        </div>
      </div>
    </main>
  );
}

export default Game;