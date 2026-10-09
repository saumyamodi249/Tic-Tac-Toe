import React from 'react';
import { Player } from '../game/types';
import { AlertCircle } from 'lucide-react';

interface ScoreBoardProps {
  playerXName: string;
  playerOName: string;
  currentTurn: Player;
  xMarksCount: number;
  oMarksCount: number;
  userPlayer?: Player | null;
  opponentDisconnected?: boolean;
  reconnectRemainingSeconds?: number | null;
  onClaimForfeit?: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  playerXName,
  playerOName,
  currentTurn,
  xMarksCount,
  oMarksCount,
  userPlayer = null,
  opponentDisconnected = false,
  reconnectRemainingSeconds = null,
  onClaimForfeit,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {/* 30-Second Reconnection Alert (Online mode) */}
      {opponentDisconnected && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs sm:text-sm animate-pulse">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
            <span>
              Opponent disconnected! Reconnecting...{' '}
              {reconnectRemainingSeconds !== null && (
                <strong className="font-mono text-rose-700 dark:text-white ml-1">
                  {reconnectRemainingSeconds}s
                </strong>
              )}
            </span>
          </div>

          {reconnectRemainingSeconds !== null && reconnectRemainingSeconds <= 0 && onClaimForfeit && (
            <button
              onClick={onClaimForfeit}
              className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-rose-600/30 focus-ring"
            >
              Claim Forfeit
            </button>
          )}
        </div>
      )}

      {/* Main Players Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Player X Card */}
        <div
          className={`
            relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300
            ${
              currentTurn === 'X'
                ? 'bg-[var(--bg-card)] border-[#B88931] dark:border-[#8CA98F] shadow-md ring-1 ring-[#B88931]/30 dark:ring-[#8CA98F]/30'
                : 'bg-[var(--bg-card)]/75 border-[var(--border-color)] opacity-80'
            }
          `}
        >
          {/* Turn Indicator Pill */}
          {currentTurn === 'X' && (
            <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-[#B88931] text-[#1C1714] dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-[9px] tracking-widest uppercase shadow-sm">
              Turn
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center font-heading font-bold text-base flex-shrink-0">
                X
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-heading font-medium text-[var(--text-primary)] truncate">
                  {playerXName}
                </p>
                {userPlayer === 'X' && (
                  <span className="text-[10px] text-[#B88931] dark:text-[#8CA98F] font-serif italic">(You)</span>
                )}
              </div>
            </div>

            {/* Active Marks Gauge */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((slot) => {
                  const isFilled = slot < xMarksCount;
                  const isOldest = slot === 0 && xMarksCount === 3;
                  return (
                    <div
                      key={slot}
                      className={`
                        w-2.5 h-2.5 rounded-full transition-all duration-300
                        ${
                          isOldest
                            ? 'bg-[#B88931] dark:bg-[#8CA98F] ring-2 ring-[#B88931]/50 dark:ring-[#8CA98F]/50 animate-ping'
                            : isFilled
                            ? 'bg-[#B88931] dark:bg-[#8CA98F] shadow-sm'
                            : 'bg-transparent border border-[var(--border-color)]'
                        }
                      `}
                      title={isOldest ? 'Oldest mark (will vanish next)' : isFilled ? 'Active mark' : 'Available slot'}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-display text-[var(--text-muted)] mt-1.5">
                {xMarksCount}/3
              </span>
            </div>
          </div>
        </div>

        {/* Player O Card */}
        <div
          className={`
            relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300
            ${
              currentTurn === 'O'
                ? 'bg-[var(--bg-card)] border-[#8B2635] dark:border-[#D4846A] shadow-md ring-1 ring-[#8B2635]/30 dark:ring-[#D4846A]/30'
                : 'bg-[var(--bg-card)]/75 border-[var(--border-color)] opacity-80'
            }
          `}
        >
          {/* Turn Indicator Pill */}
          {currentTurn === 'O' && (
            <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-[#8B2635] text-white dark:bg-[#D4846A] dark:text-[#131914] font-display font-semibold text-[9px] tracking-widest uppercase shadow-sm">
              Turn
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#8B2635]/15 text-[#8B2635] dark:bg-[#D4846A]/20 dark:text-[#D4846A] flex items-center justify-center font-heading font-bold text-base flex-shrink-0">
                O
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-heading font-medium text-[var(--text-primary)] truncate">
                  {playerOName}
                </p>
                {userPlayer === 'O' && (
                  <span className="text-[10px] text-[#8B2635] dark:text-[#D4846A] font-serif italic">(You)</span>
                )}
              </div>
            </div>

            {/* Active Marks Gauge */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((slot) => {
                  const isFilled = slot < oMarksCount;
                  const isOldest = slot === 0 && oMarksCount === 3;
                  return (
                    <div
                      key={slot}
                      className={`
                        w-2.5 h-2.5 rounded-full transition-all duration-300
                        ${
                          isOldest
                            ? 'bg-[#8B2635] dark:bg-[#D4846A] ring-2 ring-[#8B2635]/50 dark:ring-[#D4846A]/50 animate-ping'
                            : isFilled
                            ? 'bg-[#8B2635] dark:bg-[#D4846A] shadow-sm'
                            : 'bg-transparent border border-[var(--border-color)]'
                        }
                      `}
                      title={isOldest ? 'Oldest mark (will vanish next)' : isFilled ? 'Active mark' : 'Available slot'}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-display text-[var(--text-muted)] mt-1.5">
                {oMarksCount}/3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
