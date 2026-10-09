import React from 'react';
import { Gamepad2, Globe, Key, HelpCircle, Repeat, Trophy, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { UserProfile } from '../services/auth';

interface LandingPageProps {
  profile?: UserProfile;
  onPlayLocal: () => void;
  onFindMatch: () => void;
  onOpenPrivateRooms: () => void;
  onOpenHowToPlay: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayLocal,
  onFindMatch,
  onOpenPrivateRooms,
  onOpenHowToPlay,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-14">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-rose-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold backdrop-blur-md animate-fade-in shadow-lg shadow-sky-500/5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Strategic Infinite Tic-Tac-Toe</span>
        </div>

        {/* Wordmark & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          TRIPLE{' '}
          <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-rose-400 bg-clip-text text-transparent">
            LOOP
          </span>
        </h1>

        <p className="text-base sm:text-xl font-medium text-slate-300 tracking-tight max-w-lg mx-auto leading-relaxed">
          Three marks. One board. <span className="text-sky-400 font-semibold">Never stop thinking.</span>
        </p>

        {/* Core Mechanic Mini Explanation */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-300 max-w-lg mx-auto flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center flex-shrink-0">
            <Repeat className="w-4 h-4 animate-spin [animation-duration:10s]" />
          </div>
          <p className="leading-snug">
            Each player can have only <strong className="text-white">3 active marks</strong>. Placing your 4th mark automatically removes your oldest mark!
          </p>
        </div>
      </div>

      {/* Main Game Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-2xl">
        {/* Play Local */}
        <button
          onClick={onPlayLocal}
          className="group relative p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-sky-500/50 shadow-xl transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] focus-ring"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
              Same Device
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
              <span>Play Local</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pass and play with a friend on this screen. No internet or setup needed.
            </p>
          </div>
        </button>

        {/* Find Online Match */}
        <button
          onClick={onFindMatch}
          className="group relative p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/50 shadow-xl transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] focus-ring"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Live Queue
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
              <span>Find Match</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Instant online matchmaking with 30s reconnection enforcement.
            </p>
          </div>
        </button>

        {/* Private Room */}
        <button
          onClick={onOpenPrivateRooms}
          className="group relative p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-rose-500/50 shadow-xl transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] focus-ring"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Key className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Room Code
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <span>Private Room</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a custom room or enter a 6-character code to play a friend.
            </p>
          </div>
        </button>

        {/* How to Play */}
        <button
          onClick={onOpenHowToPlay}
          className="group relative p-5 sm:p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-amber-500/50 shadow-xl transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.02] focus-ring"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Interactive Guide
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span>How to Play</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Interactive rules, visual diagrams, and pro strategies.
            </p>
          </div>
        </button>
      </div>

      {/* Feature Pillars Footer */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 text-center border-t border-white/5 w-full max-w-2xl text-[11px] sm:text-xs text-slate-400">
        <div className="flex flex-col items-center gap-1.5">
          <Trophy className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-300">Pure Strategy</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">No luck, no deadlocks</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">30s Reconnect</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">Server-enforced timeout</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-slate-300">Guest Ready</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">Play without sign-up</span>
        </div>
      </div>
    </div>
  );
};
