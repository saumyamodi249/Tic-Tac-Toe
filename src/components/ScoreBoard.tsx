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
            relative p-3 sm:p-4 rounded-2xl border transition-all duration-300
            ${
              currentTurn === 'X'
                ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/40 shadow-md dark:shadow-lg shadow-sky-500/10'
                : 'bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 opacity-75'
            }
          `}
        >
          {/* Turn Indicator Pill */}
          {currentTurn === 'X' && (
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase shadow-md shadow-sky-500/50">
              Turn
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                X
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {playerXName}
                </p>
                {userPlayer === 'X' && (
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">(You)</span>
                )}
              </div>
            </div>

            {/* Active Marks Gauge */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
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
                            ? 'bg-amber-400 ring-2 ring-amber-400/50 animate-ping'
                            : isFilled
                            ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                            : 'bg-slate-200 dark:bg-slate-700/60 border border-slate-300 dark:border-white/10'
                        }
                      `}
                      title={isOldest ? 'Oldest mark (will vanish next)' : isFilled ? 'Active mark' : 'Available slot'}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                {xMarksCount}/3 marks
              </span>
            </div>
          </div>
        </div>

        {/* Player O Card */}
        <div
          className={`
            relative p-3 sm:p-4 rounded-2xl border transition-all duration-300
            ${
              currentTurn === 'O'
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40 shadow-md dark:shadow-lg shadow-rose-500/10'
                : 'bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 opacity-75'
            }
          `}
        >
          {/* Turn Indicator Pill */}
          {currentTurn === 'O' && (
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md shadow-rose-500/50">
              Turn
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                O
              </div>
              <div className="truncate">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {playerOName}
                </p>
                {userPlayer === 'O' && (
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">(You)</span>
                )}
              </div>
            </div>

            {/* Active Marks Gauge */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
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
                            ? 'bg-amber-400 ring-2 ring-amber-400/50 animate-ping'
                            : isFilled
                            ? 'bg-rose-400 shadow-sm shadow-rose-400/50'
                            : 'bg-slate-200 dark:bg-slate-700/60 border border-slate-300 dark:border-white/10'
                        }
                      `}
                      title={isOldest ? 'Oldest mark (will vanish next)' : isFilled ? 'Active mark' : 'Available slot'}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                {oMarksCount}/3 marks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
