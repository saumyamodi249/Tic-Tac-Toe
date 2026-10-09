import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, MatchStatus } from '../game/types';
import { Trophy, RefreshCw, Home, Handshake, Zap } from 'lucide-react';

interface VictoryModalProps {
  status: MatchStatus;
  winner: Player | null;
  playerXName: string;
  playerOName: string;
  moveCount: number;
  isRematchRequested?: boolean;
  onRematch: () => void;
  onReturnToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  status,
  winner,
  playerXName,
  playerOName,
  moveCount,
  isRematchRequested = false,
  onRematch,
  onReturnToMenu,
}) => {
  useEffect(() => {
    if (status === 'won') {
      // Trigger festive confetti blast
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#f43f5e', '#34d399', '#fbbf24'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [status]);

  const isDraw = status === 'draw';
  const winnerName = winner === 'X' ? playerXName : playerOName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl text-center space-y-6 animate-scale-in">
        {/* Glow effect */}
        <div
          className={`
            absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full blur-2xl pointer-events-none
            ${
              isDraw
                ? 'bg-amber-500/20'
                : winner === 'X'
                ? 'bg-sky-500/30'
                : 'bg-rose-500/30'
            }
          `}
        />

        {/* Icon & Banner */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl
              ${
                isDraw
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                  : winner === 'X'
                  ? 'bg-sky-500/20 text-sky-500 dark:text-sky-400 border border-sky-500/30'
                  : 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30'
              }
            `}
          >
            {isDraw ? <Handshake className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isDraw ? 'Tactical Draw' : `${winnerName} Wins!`}
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              {isDraw
                ? 'Both players agreed to a mutual draw.'
                : `Victory achieved in ${moveCount} strategic moves.`}
            </p>
          </div>
        </div>

        {/* Stats summary badge */}
        <div className="flex items-center justify-around py-3 px-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Moves</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{moveCount}</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">Rule</span>
            <span className="font-bold text-sky-500 dark:text-sky-400 text-sm">3-Mark Loop</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onRematch}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all transform active:scale-95 focus-ring"
          >
            {isRematchRequested ? (
              <>
                <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Rematch Accepted!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Play Again / Rematch</span>
              </>
            )}
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all focus-ring"
          >
            <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
