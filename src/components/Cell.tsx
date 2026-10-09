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
        transition-all duration-300 select-none focus-ring
        ${
          isWinningCell
            ? 'bg-[#B88931]/20 dark:bg-[#8CA98F]/25 border-2 border-[var(--accent-primary)] shadow-lg scale-[1.03] z-20'
            : value
            ? 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm'
            : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95'
        }
      `}
    >
      {/* Active Mark Rendering */}
      {value === 'X' && (
        <div className="relative w-3/5 h-3/5 flex items-center justify-center animate-scale-in">
          <svg className="w-full h-full drop-shadow-[0_2px_10px_var(--glow-x)]" viewBox="0 0 100 100" fill="none">
            <line
              x1="22"
              y1="22"
              x2="78"
              y2="78"
              stroke="var(--player-x)"
              strokeWidth="13"
              strokeLinecap="round"
            />
            <line
              x1="78"
              y1="22"
              x2="22"
              y2="78"
              stroke="var(--player-x)"
              strokeWidth="13"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {value === 'O' && (
        <div className="relative w-3/5 h-3/5 flex items-center justify-center animate-scale-in">
          <svg className="w-full h-full drop-shadow-[0_2px_10px_var(--glow-o)]" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="32"
              stroke="var(--player-o)"
              strokeWidth="13"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Ghost Hover Preview (when empty) */}
      {!value && isHovered && isActiveTurn && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 transition-opacity">
          {currentTurn === 'X' ? (
            <svg className="w-3/5 h-3/5" viewBox="0 0 100 100" fill="none">
              <line x1="22" y1="22" x2="78" y2="78" stroke="var(--player-x)" strokeWidth="11" strokeLinecap="round" />
              <line x1="78" y1="22" x2="22" y2="78" stroke="var(--player-x)" strokeWidth="11" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-3/5 h-3/5" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="32" stroke="var(--player-o)" strokeWidth="11" />
            </svg>
          )}
        </div>
      )}

      {/* Mark Age Indicators: Classical Roman Numerals & Vanish Warning */}
      {value && markOrderInfo && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
          {markOrderInfo.isOldest ? (
            <span
              title="Oldest mark (will vanish next)"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-display font-bold bg-[#B88931]/20 text-[#B88931] dark:bg-[#8CA98F]/25 dark:text-[#8CA98F] border border-[var(--accent-primary)]/40 animate-pulse shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
              I
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-display font-medium bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
              {markOrderInfo.order === 2 ? 'II' : 'III'}
            </span>
          )}
        </div>
      )}

      {/* Cell Index Label */}
      <span className="absolute top-1.5 left-2 text-[10px] font-display text-[var(--text-muted)] select-none opacity-50">
        {index + 1}
      </span>
    </button>
  );
};
