import { useState, useEffect } from 'react';
import { authService, UserProfile } from './services/auth';
import { sound } from './lib/sound';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LocalGamePage } from './pages/LocalGamePage';
import { OnlineRoomPage } from './pages/OnlineRoomPage';
import { MatchmakingPage } from './pages/MatchmakingPage';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';

type AppView = 'landing' | 'local' | 'online_room' | 'matchmaking';

export function App() {
  const [view, setView] = useState<AppView>('landing');
  const [profile, setProfile] = useState<UserProfile>(() => ({
    id: 'guest-init',
    username: 'Tactician',
    isGuest: true,
  }));

  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('triple_loop_theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  // Load active user profile & subscribe to auth changes
  useEffect(() => {
    authService.getCurrentProfile().then((p) => setProfile(p));
    const { unsubscribe } = authService.onAuthStateChange((p) => setProfile(p));
    return () => unsubscribe();
  }, []);

  // Sync theme class and attribute to document root
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('triple_loop_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleResetSession = () => {
    localStorage.removeItem('triple_loop_guest_id');
    localStorage.removeItem('triple_loop_nickname');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        isMuted={isMuted}
        isDark={isDark}
        onToggleSound={handleToggleSound}
        onToggleTheme={handleToggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onNavigateHome={() => setView('landing')}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {view === 'landing' && (
          <LandingPage
            profile={profile}
            onPlayLocal={() => setView('local')}
            onFindMatch={() => setView('matchmaking')}
            onOpenPrivateRooms={() => setView('online_room')}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          />
        )}

        {view === 'local' && (
          <LocalGamePage
            defaultPlayerName={profile.username}
            onReturnToMenu={() => setView('landing')}
          />
        )}

        {view === 'online_room' && (
          <OnlineRoomPage
            profile={profile}
            onReturnToMenu={() => setView('landing')}
          />
        )}

        {view === 'matchmaking' && (
          <MatchmakingPage
            profile={profile}
            onReturnToMenu={() => setView('landing')}
          />
        )}
      </main>

      {/* Global Modals */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        profile={profile}
        onClose={() => setIsAuthOpen(false)}
        onProfileUpdated={(p) => setProfile(p)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        isMuted={isMuted}
        isDark={isDark}
        onClose={() => setIsSettingsOpen(false)}
        onToggleSound={handleToggleSound}
        onToggleTheme={handleToggleTheme}
        onResetSession={handleResetSession}
      />
    </div>
  );
}

export default App;
