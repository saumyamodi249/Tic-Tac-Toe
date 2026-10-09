import React, { useState } from 'react';
import { GameState, Player } from '../game/types';
import {
  createInitialGameState,
  makeMove,
  offerDraw,
  acceptDraw,
  declineDraw,
} from '../game/engine';
import { Board } from '../components/Board';
import { ScoreBoard } from '../components/ScoreBoard';
import { DrawDialog } from '../components/DrawDialog';
import { VictoryModal } from '../components/VictoryModal';
import { sound } from '../lib/sound';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface LocalGamePageProps {
  defaultPlayerName?: string;
  onReturnToMenu: () => void;
}

export const LocalGamePage: React.FC<LocalGamePageProps> = ({
  defaultPlayerName = 'Player 1',
  onReturnToMenu,
}) => {
  const [playerXName] = useState(defaultPlayerName);
  const [playerOName] = useState('Player 2');

  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [scores, setScores] = useState<{ X: number; O: number; draws: number }>({
    X: 0,
    O: 0,
    draws: 0,
  });

  const handleCellClick = (index: number) => {
    if (gameState.status !== 'active') return;

    const currentTurn = gameState.currentTurn;
    const result = makeMove(gameState, index);

    if (result.success && result.newState) {
      // Play sound effects
      if (result.removedCellIndex !== null && result.removedCellIndex !== undefined) {
        sound.playMarkVanish();
      }

      if (currentTurn === 'X') {
        sound.playMoveX();
      } else {
        sound.playMoveO();
      }

      const next = result.newState;
      setGameState(next);

      // Check win or draw sound & score updates
      if (next.status === 'won' && next.winner) {
        sound.playWin();
        setScores((prev) => ({
          ...prev,
          [next.winner!]: prev[next.winner!] + 1,
        }));
      } else if (next.status === 'draw') {
        sound.playDraw();
        setScores((prev) => ({
          ...prev,
          draws: prev.draws + 1,
        }));
      }
    }
  };

  const handleOfferDraw = () => {
    const current = gameState.currentTurn;
    const res = offerDraw(gameState, current);
    if (res.success && res.newState) {
      setGameState(res.newState);
      sound.playClick();
    }
  };

  const handleAcceptDraw = () => {
    if (!gameState.drawOffer) return;
    const opponent: Player = gameState.drawOffer.offeredBy === 'X' ? 'O' : 'X';
    const res = acceptDraw(gameState, opponent);
    if (res.success && res.newState) {
      setGameState(res.newState);
      sound.playDraw();
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  const handleDeclineDraw = () => {
    if (!gameState.drawOffer) return;
    const opponent: Player = gameState.drawOffer.offeredBy === 'X' ? 'O' : 'X';
    const res = declineDraw(gameState, opponent);
    if (res.success && res.newState) {
      setGameState(res.newState);
      sound.playClick();
    }
  };

  const handleRestart = () => {
    setGameState(createInitialGameState());
    sound.playClick();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between max-w-xl mx-auto px-4 py-4 sm:py-6 w-full space-y-6 animate-fade-in">
      {/* Top Header / Back & Stats */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onReturnToMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-display transition-all focus-ring shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        {/* Local Round Series Scores */}
        <div className="flex items-center gap-2.5 text-xs font-display px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
          <span className="text-[var(--player-x)] font-bold">{playerXName}: {scores.X}</span>
          <span className="text-[var(--border-color)]">•</span>
          <span className="text-[var(--player-o)] font-bold">{playerOName}: {scores.O}</span>
          {scores.draws > 0 && (
            <>
              <span className="text-[var(--border-color)]">•</span>
              <span className="text-[var(--text-muted)] font-serif italic">Draws: {scores.draws}</span>
            </>
          )}
        </div>

        <button
          onClick={handleRestart}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all focus-ring shadow-sm"
          title="Restart match"
          aria-label="Restart match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ScoreBoard & Turn Indicator */}
      <ScoreBoard
        playerXName={playerXName}
        playerOName={playerOName}
        currentTurn={gameState.currentTurn}
        xMarksCount={gameState.marksHistory.X.length}
        oMarksCount={gameState.marksHistory.O.length}
      />

      {/* Interactive 3x3 Game Board */}
      <Board
        gameState={gameState}
        onCellClick={handleCellClick}
      />

      {/* Draw Action Controls */}
      <div className="w-full flex justify-center min-h-[48px]">
        {gameState.status === 'active' && (
          <DrawDialog
            drawOffer={gameState.drawOffer}
            playerXName={playerXName}
            playerOName={playerOName}
            onOfferDraw={handleOfferDraw}
            onAcceptDraw={handleAcceptDraw}
            onDeclineDraw={handleDeclineDraw}
          />
        )}
      </div>

      {/* Victory / Result Modal */}
      {(gameState.status === 'won' || gameState.status === 'draw') && (
        <VictoryModal
          status={gameState.status}
          winner={gameState.winner}
          playerXName={playerXName}
          playerOName={playerOName}
          moveCount={gameState.moveCount}
          onRematch={handleRestart}
          onReturnToMenu={onReturnToMenu}
        />
      )}
    </div>
  );
};
