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
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Handshake className="w-4 h-4 text-sky-500 dark:text-sky-400" />
        <span>Offer Draw</span>
      </button>
    );
  }

  const offeringPlayerName = drawOffer.offeredBy === 'X' ? playerXName : playerOName;
  const isOfferedByMe = userPlayer ? drawOffer.offeredBy === userPlayer : false;

  // In online mode if offered by me: show waiting status
  if (userPlayer && isOfferedByMe) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-amber-500 dark:text-amber-400" />
        <span>Draw offered. Awaiting opponent response...</span>
        <button
          onClick={onDeclineDraw}
          className="ml-2 px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[11px] font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Incoming offer to accept or decline
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 text-slate-800 dark:text-slate-200 text-xs shadow-xl animate-fade-in">
      <Handshake className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">
          {offeringPlayerName} offered a Draw
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Do you accept the mutual draw?</p>
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={onAcceptDraw}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors focus-ring"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept</span>
        </button>
        <button
          onClick={onDeclineDraw}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors focus-ring"
        >
          <X className="w-3.5 h-3.5" />
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
};
