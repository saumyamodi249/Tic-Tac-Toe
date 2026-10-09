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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/15 shadow-2xl text-left space-y-5 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-ring"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Player Identity</h2>
            <p className="text-xs text-slate-400">
              {profile.isGuest ? 'Playing as Guest' : `Account: ${profile.email}`}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-slate-950/60 p-1 border border-white/5 text-xs font-semibold">
          <button
            onClick={() => { setTab('nickname'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'nickname'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nickname
          </button>
          <button
            onClick={() => { setTab('signin'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'signin'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'signup'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Nickname Tab */}
        {tab === 'nickname' && (
          <form onSubmit={handleSaveNickname} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Nickname
              </label>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={20}
                placeholder="Enter player nickname..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Visible to opponents in local matches, private rooms, and matchmaking.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 focus-ring"
            >
              Save Nickname
            </button>

            {!profile.isGuest && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all focus-ring"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out (Switch to Guest)</span>
              </button>
            )}
          </form>
        )}

        {/* Sign In Tab */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            {!isSupabaseConfigured() && (
              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Note: Supabase configuration in .env is required for registered cloud authentication. Guest mode works out of the box!
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 focus-ring disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register Tab */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Pick a username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters..."
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus-ring"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 focus-ring disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
