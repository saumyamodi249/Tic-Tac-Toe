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
      // Trigger festive classical confetti blast in brass, crimson, sage, and terracotta
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#C9A962', '#8B2635', '#8CA98F', '#D4846A', '#F6F1EA'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [status]);

  const isDraw = status === 'draw';
  const winnerName = winner === 'X' ? playerXName : playerOName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1714]/60 dark:bg-[#0E1410]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-[var(--bg-modal)] border-2 border-[var(--border-color)] shadow-2xl text-center space-y-6 animate-scale-in">
        {/* Glow effect */}
        <div
          className={`
            absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl pointer-events-none
            ${
              isDraw
                ? 'bg-[#B88931]/15 dark:bg-[#8CA98F]/15'
                : winner === 'X'
                ? 'bg-[#B88931]/25 dark:bg-[#8CA98F]/25'
                : 'bg-[#8B2635]/25 dark:bg-[#D4846A]/25'
            }
          `}
        />

        {/* Icon & Banner */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center shadow-md
              ${
                isDraw
                  ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)] border border-[var(--border-color)]'
                  : winner === 'X'
                  ? 'bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] border border-[#B88931]/30 dark:border-[#8CA98F]/30'
                  : 'bg-[#8B2635]/15 text-[#8B2635] dark:bg-[#D4846A]/20 dark:text-[#D4846A] border border-[#8B2635]/30 dark:border-[#D4846A]/30'
              }
            `}
          >
            {isDraw ? <Handshake className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
          </div>

          <div>
            <h2 className="text-3xl font-heading font-medium tracking-tight text-[var(--text-primary)]">
              {isDraw ? 'Tactical Accord' : `${winnerName} Prevails!`}
            </h2>
            <p className="text-xs sm:text-sm font-body text-[var(--text-secondary)] italic mt-1.5 leading-relaxed">
              {isDraw
                ? 'Both tacticians concluded in mutual accord.'
                : `Victory inscribed after ${moveCount} strategic placements.`}
            </p>
          </div>
        </div>

        {/* Stats summary badge */}
        <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[9px] uppercase font-display tracking-widest">Placements</span>
            <span className="font-heading font-bold text-[var(--text-primary)] text-lg">{moveCount}</span>
          </div>
          <div className="w-px h-6 bg-[var(--border-color)]" />
          <div>
            <span className="text-[var(--text-muted)] block text-[9px] uppercase font-display tracking-widest">Discipline</span>
            <span className="font-heading font-bold text-[var(--accent-primary)] text-lg">3-Mark Loop</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onRematch}
            className="w-full py-3.5 px-4 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-95 focus-ring"
          >
            {isRematchRequested ? (
              <>
                <Zap className="w-4 h-4 text-[#1C1714] animate-bounce" />
                <span>Rematch Bound!</span>
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
            className="w-full py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-display text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all focus-ring shadow-sm"
          >
            <Home className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Return to Concourse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
