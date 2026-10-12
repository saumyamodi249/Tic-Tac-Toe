import React from 'react';
import { Crown, Swords, Shield, Sparkles, Compass, BookOpen, Flame, Feather, User } from 'lucide-react';

export const AVATAR_OPTIONS = [
  { id: 'crown', label: 'Sovereign', icon: Crown, bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40' },
  { id: 'swords', label: 'Duelist', icon: Swords, bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40' },
  { id: 'shield', label: 'Guardian', icon: Shield, bg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40' },
  { id: 'sparkles', label: 'Mystic', icon: Sparkles, bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40' },
  { id: 'compass', label: 'Navigator', icon: Compass, bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' },
  { id: 'book', label: 'Scholar', icon: BookOpen, bg: 'bg-[#B88931]/15 text-[#B88931] dark:text-[#8CA98F] border-[#B88931]/40' },
  { id: 'flame', label: 'Champion', icon: Flame, bg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40' },
  { id: 'feather', label: 'Chronicler', icon: Feather, bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/40' },
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

interface AvatarIconProps {
  avatar?: string;
  className?: string;
  fallbackText?: string;
}

export const AvatarIcon: React.FC<AvatarIconProps> = ({ avatar, className = 'w-4 h-4', fallbackText }) => {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatar);
  if (found) {
    const IconComponent = found.icon;
    return <IconComponent className={className} />;
  }

  if (fallbackText) {
    return <span className="font-bold text-xs">{fallbackText.charAt(0).toUpperCase()}</span>;
  }

  return <User className={className} />;
};

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarId: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedAvatar, onSelectAvatar }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)]">
        Scholar Crest (Avatar)
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {AVATAR_OPTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedAvatar === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectAvatar(item.id)}
              title={item.label}
              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all focus-ring ${
                isSelected
                  ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/40 shadow-md scale-105 bg-[var(--bg-card)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-input)] hover:border-[var(--border-color-hover)] opacity-75 hover:opacity-100 hover:scale-102'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${item.bg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-display uppercase tracking-wider text-[var(--text-muted)] truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
