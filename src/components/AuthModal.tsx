import React, { useState } from 'react';
import { X, User, Lock, Mail, Check, AlertCircle, LogOut } from 'lucide-react';
import { UserProfile, authService, saveNickname } from '../services/auth';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  profile,
  onClose,
  onProfileUpdated,
}) => {
  const [tab, setTab] = useState<'nickname' | 'signin' | 'signup'>('nickname');
  const [nicknameInput, setNicknameInput] = useState(profile.username);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    saveNickname(nicknameInput);
    onProfileUpdated({
      ...profile,
      username: nicknameInput.trim(),
    });
    setSuccessMsg('Nickname updated successfully!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await authService.signIn(email, password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      const updated = await authService.getCurrentProfile();
      onProfileUpdated(updated);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await authService.signUp(email, password, regUsername);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      const updated = await authService.getCurrentProfile();
      onProfileUpdated(updated);
      setSuccessMsg('Account created! Please check your email for confirmation.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    const updated = await authService.getCurrentProfile();
    onProfileUpdated(updated);
    setSuccessMsg('Switched back to Guest session.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1714]/60 dark:bg-[#0E1410]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[var(--bg-modal)] border-2 border-[var(--border-color)] shadow-2xl text-left space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] transition-colors focus-ring"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-medium text-[var(--text-primary)] tracking-tight">Scholar Identity</h2>
            <p className="text-xs font-body text-[var(--text-muted)] italic">
              {profile.isGuest ? 'Participating under Guest Pseudonym' : `Tome Record: ${profile.email}`}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--border-color)] text-xs font-display">
          <button
            onClick={() => { setTab('nickname'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg tracking-wider uppercase transition-all focus-ring ${
              tab === 'nickname'
                ? 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Pseudonym
          </button>
          <button
            onClick={() => { setTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg tracking-wider uppercase transition-all focus-ring ${
              tab === 'signin'
                ? 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg tracking-wider uppercase transition-all focus-ring ${
              tab === 'signup'
                ? 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#8B2635]/10 border border-[#8B2635]/30 text-[#8B2635] dark:border-[#D4846A]/30 dark:bg-[#D4846A]/10 dark:text-[#D4846A] text-xs font-body flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-body flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Nickname Tab */}
        {tab === 'nickname' && (
          <form onSubmit={handleSaveNickname} className="space-y-4">
            <div>
              <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
                Display Pseudonym
              </label>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                placeholder="Enter player pseudonym..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                required
              />
              <p className="text-[11px] font-body text-[var(--text-muted)] italic mt-1.5">
                Inscribed onto match scrolls, private room scrolls, and global pairings.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring"
            >
              Inscribe Pseudonym
            </button>

            {!profile.isGuest && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-display text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all focus-ring"
              >
                <LogOut className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#D4846A]" />
                <span>Sign Out (Revert to Guest)</span>
              </button>
            )}
          </form>
        )}

        {/* Sign In Tab */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {!isSupabaseConfigured() && (
              <p className="text-[11px] font-body text-amber-800 dark:text-amber-200 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 italic">
                Note: Supabase configuration in .env is required for cloud scholar accounts. Guest mode functions unconditionally!
              </p>
            )}

            <div>
              <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
                Scholar Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@academy.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
                Secret Cipher (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Sanctuary'}
            </button>
          </form>
        )}

        {/* Register Tab */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
                Scholar Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Choose scholar title..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
                Scholar Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@academy.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)] mb-1.5">
                Secret Cipher (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters..."
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring disabled:opacity-50"
            >
              {loading ? 'Matriculating...' : 'Matriculate & Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
