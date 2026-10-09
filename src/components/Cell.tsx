import React, { useState } from 'react';
import { Player } from '../game/types';

interface CellProps {
  index: number;
  value: Player | null;
  currentTurn: Player;
  isActiveTurn: boolean;
  isWinningCell: boolean;
  markOrderInfo: { player: Player; order: number; isOldest: boolean } | null;
  disabled: boolean;
  onClick: () => void;
}

export const Cell: React.FC<CellProps> = ({
  index,
  value,
  currentTurn,
  isActiveTurn,
  isWinningCell,
  markOrderInfo,
  disabled,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const getAriaLabel = () => {
    if (value) {
      let label = `Cell ${index + 1}, occupied by Player ${value}`;
      if (markOrderInfo) {
        label += `, mark ${markOrderInfo.order} of 3`;
        if (markOrderInfo.isOldest) {
          label += ` (oldest mark, will be removed on next placement)`;
        }
      }
      return label;
    }
    return `Cell ${index + 1}, empty${isActiveTurn ? `, press Enter to place ${currentTurn}` : ''}`;
  };

  return (
    <button
      id={`cell-${index}`}
      type="button"
      role="gridcell"
      aria-label={getAriaLabel()}
      disabled={disabled || value !== null}
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group w-full aspect-square rounded-2xl flex flex-col items-center justify-center
        transition-all duration-200 select-none focus-ring
        ${
          isWinningCell
            ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-[1.03] z-20'
            : value
            ? 'bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none'
            : 'bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-200/50 dark:hover:bg-slate-900/80 active:scale-95'
        }
      `}
    >
      {/* Active Mark Rendering */}
      {value === 'X' && (
        <div className="relative w-3/5 h-3/5 flex items-center justify-center animate-scale-in">
          <svg className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]" viewBox="0 0 100 100" fill="none">
            <line
              x1="20"
              y1="20"
              x2="80"
              y2="80"
              stroke="#38bdf8"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <line
              x1="80"
              y1="20"
              x2="20"
              y2="80"
              stroke="#38bdf8"
              strokeWidth="14"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {value === 'O' && (
        <div className="relative w-3/5 h-3/5 flex items-center justify-center animate-scale-in">
          <svg className="w-full h-full drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="34"
              stroke="#f43f5e"
              strokeWidth="14"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Ghost Hover Preview (when empty) */}
      {!value && isHovered && isActiveTurn && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 transition-opacity">
          {currentTurn === 'X' ? (
            <svg className="w-3/5 h-3/5 text-sky-500 dark:text-sky-400" viewBox="0 0 100 100" fill="none">
              <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-3/5 h-3/5 text-rose-500 dark:text-rose-400" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="12" />
            </svg>
          )}
        </div>
      )}

      {/* Mark Age Indicators (1, 2, or 3) and Oldest Warning Pulse */}
      {value && markOrderInfo && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
          {markOrderInfo.isOldest ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping" />
              1st
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-white/5">
              {markOrderInfo.order}#
            </span>
          )}
        </div>
      )}

      {/* Cell Index Label (subtle in corner for accessibility & keyboard users) */}
      <span className="absolute top-1.5 left-2 text-[10px] font-mono text-slate-400 dark:text-slate-600 select-none">
        {index + 1}
      </span>
    </button>
  );
};
