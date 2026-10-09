import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../services/auth';
import { onlineGameService, OnlineMatchData, RoomData } from '../services/onlineGame';
import { isSupabaseConfigured } from '../services/supabase';
import { GameState, Player } from '../game/types';
import { Board } from '../components/Board';
import { ScoreBoard } from '../components/ScoreBoard';
import { DrawDialog } from '../components/DrawDialog';
import { VictoryModal } from '../components/VictoryModal';
import { sound } from '../lib/sound';
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  Key,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface OnlineRoomPageProps {
  profile: UserProfile;
  initialRoomCode?: string;
  onReturnToMenu: () => void;
}

export const OnlineRoomPage: React.FC<OnlineRoomPageProps> = ({
  profile,
  initialRoomCode = '',
  onReturnToMenu,
}) => {
  const [view, setView] = useState<'lobby' | 'waiting' | 'game'>('lobby');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [matchData, setMatchData] = useState<OnlineMatchData | null>(null);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Presence & 30s Disconnect Policy State
  const [opponentOnline, setOpponentOnline] = useState(true);
  const [reconnectRemainingSeconds, setReconnectRemainingSeconds] = useState<number | null>(null);

  const activeChannelRef = useRef<ReturnType<typeof onlineGameService.subscribeToMatch>>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create Room handler
  const handleCreateRoom = async () => {
    setErrorMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      setErrorMsg('Supabase environment variables are missing in .env. Please see the Supabase Setup Guide.');
      return;
    }

    try {
      const res = await onlineGameService.createRoom(profile.id, profile.username);
      if (res) {
        setActiveRoom({
          id: res.roomId,
          code: res.roomCode,
          hostId: profile.id,
          hostName: profile.username,
          guestId: null,
          guestName: null,
          status: 'waiting',
        });
        setView('waiting');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  // Join Room handler
  const handleJoinRoom = async (codeToJoin?: string) => {
    const code = (codeToJoin || roomCodeInput).trim().toUpperCase();
    if (!code || code.length < 4) {
      setErrorMsg('Please enter a valid room code.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setLoading(false);
      setErrorMsg('Supabase environment variables are missing in .env. Please see the Supabase Setup Guide.');
      return;
    }

    try {
      const res = await onlineGameService.joinRoom(code, profile.id, profile.username);
      if (res) {
        const fullMatch = await onlineGameService.getMatch(res.matchId);
        if (fullMatch) {
          setMatchData(fullMatch);
          setView('game');
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  // Listen for guest joining while host is in waiting view
  useEffect(() => {
    if (view === 'waiting' && activeRoom?.id) {
      const channel = onlineGameService.subscribeToRoom(activeRoom.id, async (updatedRoom) => {
        if (updatedRoom.status === 'playing') {
          // Fetch created match
          const match = await onlineGameService.getMatchByRoomId(activeRoom.id);
          if (match) {
            setMatchData(match);
            setView('game');
          }
        }
      });

      return () => {
        channel?.unsubscribe();
      };
    }
  }, [view, activeRoom?.id]);

  // Handle incoming match state update
  const handleMatchUpdate = useCallback((newMatch: OnlineMatchData) => {
    setMatchData((prev) => {
      if (prev && newMatch.moveCount > prev.moveCount) {
        // Move was made
        if (newMatch.currentTurn === 'X') {
          sound.playMoveO();
        } else {
          sound.playMoveX();
        }
      }

      if (newMatch.status === 'won') {
        sound.playWin();
      } else if (newMatch.status === 'draw') {
        sound.playDraw();
      }

      return newMatch;
    });
  }, []);

  // Subscribe to real-time match channel & heartbeats when in game view
  useEffect(() => {
    if (view === 'game' && matchData?.id) {
      const channel = onlineGameService.subscribeToMatch(
        matchData.id,
        profile.id,
        handleMatchUpdate,
        (isOnline) => {
          setOpponentOnline(isOnline);
          if (!isOnline) {
            onlineGameService.recordDisconnect(matchData.id, profile.id);
          } else {
            onlineGameService.recordReconnect(matchData.id, profile.id);
          }
        }
      );

      activeChannelRef.current = channel;

      return () => {
        if (matchData.status === 'active') {
          onlineGameService.recordDisconnect(matchData.id, profile.id);
        }
        channel?.unsubscribe();
      };
    }
  }, [view, matchData?.id, profile.id, handleMatchUpdate, matchData?.status]);

  // 30-Second Reconnection Deadline countdown timer
  useEffect(() => {
    if (matchData?.reconnectDeadline && matchData.status === 'active') {
      const deadline = new Date(matchData.reconnectDeadline).getTime();

      timerIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setReconnectRemainingSeconds(remaining);
      }, 1000);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    } else {
      setReconnectRemainingSeconds(null);
    }
  }, [matchData?.reconnectDeadline, matchData?.status]);

  const handleCellClick = async (cellIndex: number) => {
    if (!matchData || matchData.status !== 'active') return;

    const mySymbol: Player = matchData.playerXId === profile.id ? 'X' : 'O';
    if (matchData.currentTurn !== mySymbol) return;

    try {
      const res = await onlineGameService.submitMove(
        matchData.id,
        profile.id,
        cellIndex,
        matchData.version
      );

      if (res.success) {
        if (res.removedCellIndex !== null && res.removedCellIndex !== undefined) {
          sound.playMarkVanish();
        }
        if (mySymbol === 'X') {
          sound.playMoveX();
        } else {
          sound.playMoveO();
        }
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleOfferDraw = async () => {
    if (!matchData) return;
    await onlineGameService.offerDraw(matchData.id, profile.id);
    sound.playClick();
  };

  const handleAcceptDraw = async () => {
    if (!matchData) return;
    await onlineGameService.respondDraw(matchData.id, profile.id, true);
    sound.playDraw();
  };

  const handleDeclineDraw = async () => {
    if (!matchData) return;
    await onlineGameService.respondDraw(matchData.id, profile.id, false);
    sound.playClick();
  };

  const handleClaimForfeit = async () => {
    if (!matchData) return;
    const res = await onlineGameService.claimForfeit(matchData.id, profile.id);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleCopyCode = () => {
    if (activeRoom?.code) {
      navigator.clipboard.writeText(activeRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const userSymbol: Player | null = matchData
    ? matchData.playerXId === profile.id
      ? 'X'
      : matchData.playerOId === profile.id
      ? 'O'
      : null
    : null;

  // Convert online match data to UI GameState
  const gameStateFromOnline: GameState | null = matchData
    ? {
        board: matchData.boardState,
        currentTurn: matchData.currentTurn,
        startingPlayer: matchData.startingPlayer,
        status: matchData.status,
        winner: matchData.winnerSymbol,
        winningLine: matchData.winningLine,
        marksHistory: {
          X: matchData.xMarks,
          O: matchData.oMarks,
        },
        moveHistory: [],
        drawOffer: matchData.drawOfferedBy
          ? {
              offeredBy: matchData.drawOfferedBy === matchData.playerXId ? 'X' : 'O',
              createdAt: Date.now(),
            }
          : null,
        moveCount: matchData.moveCount,
      }
    : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-between max-w-xl mx-auto px-4 py-4 sm:py-6 w-full space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onReturnToMenu}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-display tracking-wider uppercase transition-colors focus-ring"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        {view === 'game' && activeRoom && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B88931]/10 border border-[#B88931]/25 text-[#B88931] dark:bg-[#8CA98F]/15 dark:border-[#8CA98F]/30 dark:text-[#8CA98F] text-[11px] font-display tracking-wider uppercase">
            <span>Room: {activeRoom.code}</span>
          </div>
        )}

        <div className="w-16" />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="w-full p-3.5 rounded-xl bg-[#8B2635]/10 border border-[#8B2635]/30 text-[#8B2635] dark:border-[#D4846A]/30 dark:bg-[#D4846A]/10 dark:text-[#D4846A] text-xs font-body flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. LOBBY VIEW: Create or Join Room */}
      {view === 'lobby' && (
        <div className="w-full max-w-md space-y-6 animate-scale-in my-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] mx-auto flex items-center justify-center shadow-xs">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-heading font-medium text-[var(--text-primary)] tracking-tight">Private Chamber</h2>
            <p className="text-xs font-body italic text-[var(--text-muted)]">Engage a companion peer via unique 6-character cipher</p>
          </div>

          <div className="space-y-4">
            {/* Create Room Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-3">
              <h3 className="text-sm font-heading font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B88931] dark:text-[#8CA98F]" />
                <span>Inscribe New Chamber</span>
              </h3>
              <p className="text-xs font-body italic text-[var(--text-muted)]">
                Mint a dedicated room cipher and impart it to your opponent.
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Inscribe Chamber</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-display tracking-widest uppercase">
              <div className="flex-1 h-px bg-[var(--border-color)]" />
              <span>OR</span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>

            {/* Join Room Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md space-y-3">
              <h3 className="text-sm font-heading font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B2635] dark:text-[#D4846A]" />
                <span>Enter with Cipher</span>
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="CIPHER (e.g. 7X9K2A)"
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] font-display text-center tracking-widest text-base uppercase focus-ring"
                />
                <button
                  onClick={() => handleJoinRoom()}
                  disabled={loading || roomCodeInput.trim().length < 4}
                  className="px-6 py-3 rounded-xl bg-[#8B2635] hover:bg-[#A32D3F] dark:bg-[#D4846A] dark:hover:bg-[#C27B66] text-[#F6F1EA] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring disabled:opacity-50"
                >
                  Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. WAITING VIEW: Waiting for guest */}
      {view === 'waiting' && activeRoom && (
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl text-center space-y-6 my-auto animate-scale-in">
          <div className="w-14 h-14 rounded-3xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] mx-auto flex items-center justify-center relative shadow-xs">
            <Users className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B88931] dark:bg-[#8CA98F] rounded-full animate-ping" />
          </div>

          <div>
            <h2 className="text-3xl font-heading font-medium text-[var(--text-primary)] tracking-tight">Chamber Inscribed!</h2>
            <p className="text-xs font-body italic text-[var(--text-muted)] mt-1.5">
              Impart this 6-character cipher to your rival scholar to commence.
            </p>
          </div>

          {/* Large Code Display & Copy Action */}
          <div className="p-4.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
            <span className="text-3xl font-display font-bold tracking-widest text-[#B88931] dark:text-[#8CA98F] pl-3">
              {activeRoom.code}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-xs focus-ring"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-900 dark:text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Inscribed!' : 'Transcribe'}</span>
            </button>
          </div>

          {/* Waiting animation */}
          <div className="flex items-center justify-center gap-2.5 text-xs font-body italic text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin text-[#B88931] dark:text-[#8CA98F]" />
            <span>Awaiting opponent scholar entry into chamber...</span>
          </div>
        </div>
      )}

      {/* 3. GAME VIEW: Live Real-time Match */}
      {view === 'game' && matchData && gameStateFromOnline && (
        <>
          <ScoreBoard
            playerXName={matchData.playerXName}
            playerOName={matchData.playerOName}
            currentTurn={gameStateFromOnline.currentTurn}
            xMarksCount={gameStateFromOnline.marksHistory.X.length}
            oMarksCount={gameStateFromOnline.marksHistory.O.length}
            userPlayer={userSymbol}
            opponentDisconnected={!opponentOnline || Boolean(matchData.disconnectedPlayerId)}
            reconnectRemainingSeconds={reconnectRemainingSeconds}
            onClaimForfeit={handleClaimForfeit}
          />

          <Board
            gameState={gameStateFromOnline}
            userPlayer={userSymbol}
            onCellClick={handleCellClick}
          />

          <div className="w-full flex justify-center min-h-[48px]">
            {gameStateFromOnline.status === 'active' && (
              <DrawDialog
                drawOffer={gameStateFromOnline.drawOffer}
                userPlayer={userSymbol}
                playerXName={matchData.playerXName}
                playerOName={matchData.playerOName}
                onOfferDraw={handleOfferDraw}
                onAcceptDraw={handleAcceptDraw}
                onDeclineDraw={handleDeclineDraw}
              />
            )}
          </div>

          {(gameStateFromOnline.status === 'won' || gameStateFromOnline.status === 'draw') && (
            <VictoryModal
              status={gameStateFromOnline.status}
              winner={gameStateFromOnline.winner}
              playerXName={matchData.playerXName}
              playerOName={matchData.playerOName}
              moveCount={gameStateFromOnline.moveCount}
              onRematch={() => setView('lobby')}
              onReturnToMenu={onReturnToMenu}
            />
          )}
        </>
      )}
    </div>
  );
};
