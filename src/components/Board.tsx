import React, { useEffect } from 'react';
import { Cell } from './Cell';
import { GameState, Player } from '../game/types';
import { getMarkOrder } from '../game/engine';

interface BoardProps {
  gameState: GameState;
  disabled?: boolean;
  userPlayer?: Player | null; // For online matches, lock moves if not player's turn
  onCellClick: (index: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  disabled = false,
  userPlayer = null,
  onCellClick,
}) => {
  const isPlayerTurn = userPlayer ? gameState.currentTurn === userPlayer : true;
  const isBoardInteractive = !disabled && gameState.status === 'active' && isPlayerTurn;

  // Keyboard shortcut listener for numpad 1-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isBoardInteractive) return;

      // Numpad / Top-row numbers 1-9 mapping to standard layout:
      // 7 8 9 => indices 0 1 2
      // 4 5 6 => indices 3 4 5
      // 1 2 3 => indices 6 7 8
      // Or natural index numbers 1-9 -> indices 0-8
      const key = e.key;
      let targetIndex: number | null = null;

      if (key >= '1' && key <= '9') {
        targetIndex = parseInt(key, 10) - 1;
      }

      if (targetIndex !== null && gameState.board[targetIndex] === null) {
        onCellClick(targetIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBoardInteractive, gameState.board, onCellClick]);

  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto p-3 sm:p-4 rounded-3xl bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
      {/* Background ambient gradient glow */}
      <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-sky-500/10 via-transparent to-rose-500/10 -z-10 blur-xl pointer-events-none" />

      {/* 3x3 Grid */}
      <div
        role="grid"
        aria-label="Triple Loop 3x3 Board"
        className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 w-full h-full"
      >
        {gameState.board.map((cellValue, idx) => {
          const isWinning = Boolean(gameState.winningLine?.includes(idx));
          const markOrder = getMarkOrder(gameState, idx);

          return (
            <Cell
              key={idx}
              index={idx}
              value={cellValue}
              currentTurn={gameState.currentTurn}
              isActiveTurn={isBoardInteractive}
              isWinningCell={isWinning}
              markOrderInfo={markOrder}
              disabled={!isBoardInteractive || cellValue !== null}
              onClick={() => onCellClick(idx)}
            />
          );
        })}
      </div>
    </div>
  );
};
