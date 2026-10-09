import React from 'react';
import { X, Sparkles, Repeat, Trophy, ShieldAlert } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/15 shadow-2xl text-left space-y-6 my-8 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-ring"
          aria-label="Close how to play"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              How to Play Triple Loop
            </h2>
            <p className="text-xs text-slate-400">
              Three marks. One board. Never stop thinking.
            </p>
          </div>
        </div>

        {/* Rules Cards */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Rule 1 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Max 3 Marks on Board</h3>
              <p className="text-slate-400 text-xs">
                Unlike traditional Tic-Tac-Toe, each player can have at most{' '}
                <strong className="text-sky-300">three active marks</strong> on the 3×3 board at any time.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                <span>The Triple Loop Mechanic</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300">Core</span>
              </h3>
              <p className="text-slate-300 text-xs">
                When you place your <strong className="text-sky-300">4th mark</strong>, your{' '}
                <strong className="text-amber-300">oldest active mark (1st)</strong> is instantly removed from the board before the new mark lands!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Winning Conditions</h3>
              <p className="text-slate-400 text-xs">
                Align 3 of your marks horizontally, vertically, or diagonally. Win detection occurs after your oldest mark has vanished and your new mark is placed.
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">No Automatic Draws</h3>
              <p className="text-slate-400 text-xs">
                Since marks cycle endlessly, the board never fills up. Matches continue until a win is scored, or both players agree to a mutual draw offer.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Tip */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 text-slate-400 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>
            Look for the <strong className="text-amber-300">"1st" badge</strong> on the board to see which mark will vanish on the next move.
          </span>
        </div>

        {/* Got It Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 focus-ring"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
