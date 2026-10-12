import React, { useState, useEffect, useRef } from 'react';
import { X, User, Lock, Mail, Check, AlertCircle, LogOut, Eye, EyeOff } from 'lucide-react';
import { UserProfile, authService, saveNickname, saveAvatar, getSavedAvatar } from '../services/auth';
import { isSupabaseConfigured } from '../services/supabase';
import { AvatarIcon, AvatarPicker } from './AvatarIcon';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  getPasswordCriteria,
  USERNAME_REGEX,
  EMAIL_REGEX,
} from '../lib/validation';

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
  // If user has not signed in (guest), show Register as default!
  const [tab, setTab] = useState<'nickname' | 'signin' | 'signup'>(() => {
    return profile.isGuest ? 'signup' : 'signin';
  });
  const [nicknameInput, setNicknameInput] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || getSavedAvatar());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const prevIsOpen = useRef(false);

  // Automatically sync tab and profile state ONLY when the modal transitions to open
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setTab(profile.isGuest ? 'signup' : 'signin');
      setSelectedAvatar(profile.avatar || getSavedAvatar());
      setNicknameInput(profile.username);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, profile.isGuest, profile.avatar, profile.username]);

  // Real-time validation status for Registration
  const isUsernameValid = regUsername.length > 0 && USERNAME_REGEX.test(regUsername);
  const isEmailValid = email.length > 0 && EMAIL_REGEX.test(email);
  const passwordCriteria = getPasswordCriteria(password);

  if (!isOpen) return null;

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    saveNickname(nicknameInput);
    saveAvatar(selectedAvatar);
    onProfileUpdated({
      ...profile,
      username: nicknameInput.trim(),
      avatar: selectedAvatar,
    });
    setSuccessMsg('Pseudonym & crest updated successfully!');
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

    // 1. Scholar Username regex validation: /^[a-zA-Z0-9]+$/
    const userValidation = validateUsername(regUsername.trim());
    if (!userValidation.isValid) {
      setErrorMsg(userValidation.error || 'Scholar username is invalid.');
      return;
    }

    // 2. Scholar Email regex validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.');
      return;
    }

    // 3. Secret Cipher (Password) regex validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setErrorMsg(passwordValidation.error || 'Secret cipher complexity requirements unmet.');
      return;
    }

    setLoading(true);

    const res = await authService.signUp(email.trim(), password, regUsername.trim(), selectedAvatar);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      // If user session is returned or active (instant authentication)
      if (res.session || res.user?.confirmed_at) {
        const updated = await authService.getCurrentProfile();
        onProfileUpdated(updated);
        setSuccessMsg('Account created and signed in successfully!');
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1200);
      } else {
        // Direct redirect to signin tab as requested by user
        setTab('signin');
        setSuccessMsg('Account created successfully! Please sign in with your secret cipher.');
      }
    }
  };

  const handleCreateLocalScholar = () => {
    const userValidation = validateUsername(regUsername.trim());
    if (!userValidation.isValid) {
      setErrorMsg(userValidation.error || 'Scholar username is invalid.');
      return;
    }
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || 'Please enter a valid email address.');
      return;
    }
    const updated = authService.createLocalScholar(regUsername.trim(), email.trim(), selectedAvatar);
    onProfileUpdated(updated);
    setErrorMsg(null);
    setSuccessMsg('Rate limit bypassed! Scholar identity activated.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
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
          <div className="w-11 h-11 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-xs border border-[var(--border-color)]">
            <AvatarIcon avatar={selectedAvatar} fallbackText={profile.username} className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-medium text-[var(--text-primary)] tracking-tight">Scholar Identity</h2>
            <p className="text-xs font-body text-[var(--text-muted)] italic">
              {profile.isGuest ? 'Participating under Guest Pseudonym' : `Tome Record: ${profile.email || profile.username}`}
            </p>
          </div>
        </div>

        {/* Tab Navigation (Register prioritized for unregistered users) */}
        <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--border-color)] text-xs font-display">
          <button
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
              setShowPassword(false);
              setShowSignInPassword(false);
            }}
            className={`flex-1 py-2 rounded-lg tracking-wider uppercase transition-all focus-ring ${
              tab === 'signup'
                ? 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
              setShowPassword(false);
              setShowSignInPassword(false);
            }}
            className={`flex-1 py-2 rounded-lg tracking-wider uppercase transition-all focus-ring ${
              tab === 'signin'
                ? 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('nickname');
              setErrorMsg(null);
              setShowPassword(false);
              setShowSignInPassword(false);
            }}
            className={`flex-1 py-2 rounded-lg tracking-wider uppercase transition-all focus-ring ${
              tab === 'nickname'
                ? 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {profile.isGuest ? 'Pseudonym' : 'Profile'}
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#8B2635]/10 border border-[#8B2635]/30 text-[#8B2635] dark:border-[#D4846A]/30 dark:bg-[#D4846A]/10 dark:text-[#D4846A] text-xs font-body space-y-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            {errorMsg.toLowerCase().includes('rate limit') && (
              <div className="pt-2 border-t border-[#8B2635]/25 dark:border-[#D4846A]/25 space-y-2 text-[11px] text-[var(--text-secondary)]">
                <p>
                  Supabase free tier me verification email bhejne ki limit (3/hour) cross ho gayi hai.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleCreateLocalScholar}
                    className="flex-1 py-2 px-3 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-[10px] tracking-wider uppercase shadow-xs transition-transform active:scale-95 text-center"
                  >
                    Bypass & Register Now (Local)
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/kizgssosctcsmntrjmpb/auth/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-display text-[10px] tracking-wider uppercase text-center hover:border-[var(--accent-primary)] transition-colors flex items-center justify-center gap-1"
                  >
                    Supabase Settings ↗
                  </a>
                </div>
              </div>
            )}
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
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelectAvatar={(av) => {
                setSelectedAvatar(av);
                saveAvatar(av);
              }}
            />

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

            {profile.isGuest ? (
              <div className="pt-2 border-t border-[var(--border-color)]/60 text-center text-xs font-body text-[var(--text-muted)]">
                Want to save rank & records across devices?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                  }}
                  className="text-[var(--accent-primary)] hover:underline font-display tracking-wider uppercase font-semibold ml-1 focus-ring rounded"
                >
                  Register here
                </button>
              </div>
            ) : (
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
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
                  type={showSignInPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5 focus-ring rounded"
                  aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Sanctuary'}
            </button>

            {/* Bottom Alternatives for Sign In */}
            <div className="pt-3 border-t border-[var(--border-color)]/60 text-center space-y-2 text-xs font-body">
              <p className="text-[var(--text-muted)]">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg(null);
                    setShowPassword(false);
                    setShowSignInPassword(false);
                  }}
                  className="text-[var(--accent-primary)] hover:underline font-display tracking-wider uppercase font-semibold ml-1 focus-ring rounded"
                >
                  Register here
                </button>
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span>or</span>
                <button
                  type="button"
                  onClick={() => {
                    setTab('nickname');
                    setErrorMsg(null);
                    setShowPassword(false);
                    setShowSignInPassword(false);
                  }}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline hover:no-underline font-display tracking-wider uppercase focus-ring rounded"
                >
                  Play as Guest (Pseudonym)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Register Tab */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)]">
                  Scholar Username
                </label>
                {regUsername && (
                  <span
                    className={`text-[11px] font-body flex items-center gap-1 transition-colors ${
                      isUsernameValid
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[#8B2635] dark:text-[#D4846A]'
                    }`}
                  >
                    {isUsernameValid ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Alphanumeric ✓</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Letters & digits only</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Choose scholar title..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors ${
                    regUsername && !isUsernameValid
                      ? 'border-[#8B2635]/60 dark:border-[#D4846A]/60'
                      : 'border-[var(--border-color)]'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)]">
                  Scholar Email
                </label>
                {email && (
                  <span
                    className={`text-[11px] font-body flex items-center gap-1 transition-colors ${
                      isEmailValid
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[#8B2635] dark:text-[#D4846A]'
                    }`}
                  >
                    {isEmailValid ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Valid Email ✓</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Invalid Format</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="scholar@academy.edu"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)] border text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors ${
                    email && !isEmailValid
                      ? 'border-[#8B2635]/60 dark:border-[#D4846A]/60'
                      : 'border-[var(--border-color)]'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-display tracking-wider uppercase text-[var(--text-muted)]">
                  Secret Cipher (Password)
                </label>
                {password && (
                  <span
                    className={`text-[11px] font-body flex items-center gap-1 transition-colors ${
                      passwordCriteria.isValid
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[#8B2635] dark:text-[#D4846A]'
                    }`}
                  >
                    {passwordCriteria.isValid ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Strong Cipher ✓</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Complexity Unmet</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Minimum 8 characters with cipher complexity..."
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-input)] border text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm font-body focus-ring transition-colors ${
                    password && !passwordCriteria.isValid
                      ? 'border-[#8B2635]/60 dark:border-[#D4846A]/60'
                      : 'border-[var(--border-color)]'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5 focus-ring rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Criteria Badges */}
              <div className="mt-2.5 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1.5">
                <div className="flex items-center justify-between text-[var(--text-muted)] text-[10px] font-display uppercase tracking-wider mb-1">
                  <span>Cipher Criteria</span>
                  <span className="font-mono lowercase text-[11px] font-medium text-[var(--text-secondary)]">
                    {[
                      passwordCriteria.minLength,
                      passwordCriteria.hasUpper,
                      passwordCriteria.hasLower,
                      passwordCriteria.hasNumber,
                      passwordCriteria.hasSpecial,
                    ].filter(Boolean).length}
                    /5 met
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-body">
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      passwordCriteria.minLength
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 transition-opacity ${
                        passwordCriteria.minLength ? 'opacity-100' : 'opacity-25'
                      }`}
                    />
                    <span>8+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      passwordCriteria.hasUpper
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 transition-opacity ${
                        passwordCriteria.hasUpper ? 'opacity-100' : 'opacity-25'
                      }`}
                    />
                    <span>Uppercase (A-Z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      passwordCriteria.hasLower
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 transition-opacity ${
                        passwordCriteria.hasLower ? 'opacity-100' : 'opacity-25'
                      }`}
                    />
                    <span>Lowercase (a-z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      passwordCriteria.hasNumber
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 transition-opacity ${
                        passwordCriteria.hasNumber ? 'opacity-100' : 'opacity-25'
                      }`}
                    />
                    <span>Number (0-9)</span>
                  </div>
                  <div
                    className={`col-span-2 flex items-center gap-1.5 transition-colors ${
                      passwordCriteria.hasSpecial
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 transition-opacity ${
                        passwordCriteria.hasSpecial ? 'opacity-100' : 'opacity-25'
                      }`}
                    />
                    <span>Special symbol (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring disabled:opacity-50"
            >
              {loading ? 'Matriculating...' : 'Matriculate & Register'}
            </button>

            {/* Bottom Alternatives for Register */}
            <div className="pt-3 border-t border-[var(--border-color)]/60 text-center space-y-2 text-xs font-body">
              <p className="text-[var(--text-muted)]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setErrorMsg(null);
                    setShowPassword(false);
                    setShowSignInPassword(false);
                  }}
                  className="text-[var(--accent-primary)] hover:underline font-display tracking-wider uppercase font-semibold ml-1 focus-ring rounded"
                >
                  Sign in instead
                </button>
              </p>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span>or</span>
                <button
                  type="button"
                  onClick={() => {
                    setTab('nickname');
                    setErrorMsg(null);
                    setShowPassword(false);
                    setShowSignInPassword(false);
                  }}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline hover:no-underline font-display tracking-wider uppercase focus-ring rounded"
                >
                  Play as Guest (Pseudonym)
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
