import React from 'react';
import { Player, DrawOffer } from '../game/types';
import { Handshake, Check, X, Loader2 } from 'lucide-react';

interface DrawDialogProps {
  drawOffer: DrawOffer | null;
  userPlayer?: Player | null;
  playerXName: string;
  playerOName: string;
  onOfferDraw: () => void;
  onAcceptDraw: () => void;
  onDeclineDraw: () => void;
  disabled?: boolean;
}

export const DrawDialog: React.FC<DrawDialogProps> = ({
  drawOffer,
  userPlayer = null,
  playerXName,
  playerOName,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  disabled = false,
}) => {
  // If no offer is pending, show Offer Draw action button
  if (!drawOffer) {
    return (
      <button
        onClick={onOfferDraw}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-display tracking-wider uppercase transition-all focus-ring disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
      >
        <Handshake className="w-4 h-4 text-[var(--accent-primary)]" />
        <span>Propose Accord</span>
      </button>
    );
  }

  const offeringPlayerName = drawOffer.offeredBy === 'X' ? playerXName : playerOName;
  const isOfferedByMe = userPlayer ? drawOffer.offeredBy === userPlayer : false;

  // In online mode if offered by me: show waiting status
  if (userPlayer && isOfferedByMe) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-body italic shadow-xs">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-primary)]" />
        <span>Accord proposed. Awaiting response from opponent...</span>
        <button
          onClick={onDeclineDraw}
          className="ml-2 px-2.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-primary)] text-[var(--text-primary)] text-[10px] font-display tracking-widest uppercase"
        >
          Rescind
        </button>
      </div>
    );
  }

  // Incoming offer to accept or decline
  return (
    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent-primary)] text-[var(--text-primary)] text-xs shadow-lg animate-fade-in">
      <Handshake className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0" />
      <div>
        <p className="font-heading font-medium text-sm text-[var(--text-primary)]">
          {offeringPlayerName} proposes mutual accord
        </p>
        <p className="text-[11px] font-body text-[var(--text-muted)] italic">Do you accept a dignified draw?</p>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onAcceptDraw}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-[11px] tracking-wider uppercase shadow-xs transition-all focus-ring"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
        <button
          onClick={onDeclineDraw}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-display text-[11px] tracking-wider uppercase transition-colors focus-ring"
        >
          <X className="w-3.5 h-3.5" />
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
};
