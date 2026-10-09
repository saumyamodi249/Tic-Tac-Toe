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
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 py-8 sm:py-14 space-y-10 sm:space-y-14 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-xl">
        <p className="text-base sm:text-lg font-heading text-[var(--text-secondary)]">
          Three marks. One board. <span className="italic font-medium text-[var(--text-primary)]">Never stop thinking.</span>
        </p>

        {/* Core Mechanic Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto text-left shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <Repeat className="w-5 h-5 animate-spin [animation-duration:12s]" />
            </div>
            <div>
              <p className="font-heading font-semibold text-[var(--text-primary)] text-base mb-1">
                The Eternal Loop Principle
              </p>
              <p className="font-body text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                Each tactician may hold only <strong className="font-semibold text-[var(--text-primary)]">three active marks</strong> upon the board. Placing your fourth mark causes your oldest mark to vanish, rendering deadlocks impossible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ornate Divider with Glyph */}
      <div className="w-full max-w-md ornate-divider" aria-hidden="true" />

      {/* Main Game Mode Cards (Arch-Tops & Roman Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-2xl">
        {/* I. Play Local */}
        <button
          onClick={onPlayLocal}
          className="group relative p-6 sm:p-7 rounded-2xl sm:arch-top bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.01] focus-ring"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-display uppercase tracking-widest px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              Tome I • Local
            </span>
          </div>
          <div>
            <h3 className="text-xl font-heading font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
              <span>Pass & Play</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs sm:text-sm font-body text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Two tacticians on a single physical screen. No parchment network or setup required.
            </p>
          </div>
        </button>

        {/* II. Find Online Match */}
        <button
          onClick={onFindMatch}
          className="group relative p-6 sm:p-7 rounded-2xl sm:arch-top bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.01] focus-ring"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#8CA98F]/20 text-[#8CA98F] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-display uppercase tracking-widest px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              Tome II • Global
            </span>
          </div>
          <div>
            <h3 className="text-xl font-heading font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
              <span>Public Arena</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs sm:text-sm font-body text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Seek worthy opponents across the global matchmaking concourse.
            </p>
          </div>
        </button>

        {/* III. Private Chamber */}
        <button
          onClick={onOpenPrivateRooms}
          className="group relative p-6 sm:p-7 rounded-2xl sm:arch-top bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.01] focus-ring"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#8B2635]/15 text-[#8B2635] dark:bg-[#D4846A]/20 dark:text-[#D4846A] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Key className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-display uppercase tracking-widest px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              Tome III • Chamber
            </span>
          </div>
          <div>
            <h3 className="text-xl font-heading font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
              <span>Private Chamber</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs sm:text-sm font-body text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Dispatch a 6-character cipher to invite an ally into your dedicated hall.
            </p>
          </div>
        </button>

        {/* IV. The Codex */}
        <button
          onClick={onOpenHowToPlay}
          className="group relative p-6 sm:p-7 rounded-2xl sm:arch-top bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between hover:scale-[1.01] focus-ring"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-display uppercase tracking-widest px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              Tome IV • Codex
            </span>
          </div>
          <div>
            <h3 className="text-xl font-heading font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-2">
              <span>The Strategic Codex</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs sm:text-sm font-body text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Illuminated diagrams, historical principles, and tactical maneuvers.
            </p>
          </div>
        </button>
      </div>

      {/* Feature Pillars Footer */}
      <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 text-center border-t border-[var(--border-color)] w-full max-w-2xl text-xs text-[var(--text-secondary)]">
        <div className="flex flex-col items-center gap-2">
          <Trophy className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="font-heading font-medium text-sm text-[var(--text-primary)]">Pure Intellect</span>
          <span className="text-[11px] font-body text-[var(--text-muted)] italic hidden sm:inline">Zero chance, zero deadlocks</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="font-heading font-medium text-sm text-[var(--text-primary)]">30s Covenant</span>
          <span className="text-[11px] font-body text-[var(--text-muted)] italic hidden sm:inline">Authoritative reconnection</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
          <span className="font-heading font-medium text-sm text-[var(--text-primary)]">Open Ledger</span>
          <span className="text-[11px] font-body text-[var(--text-muted)] italic hidden sm:inline">Play without sign-up</span>
        </div>
      </div>
    </div>
  );
};
