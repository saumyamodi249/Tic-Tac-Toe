import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../services/auth';
import { matchmakingService } from '../services/matchmaking';
import { onlineGameService, OnlineMatchData } from '../services/onlineGame';
import { isSupabaseConfigured } from '../services/supabase';
import { GameState, Player } from '../game/types';
import { Board } from '../components/Board';
import { ScoreBoard } from '../components/ScoreBoard';
import { DrawDialog } from '../components/DrawDialog';
import { VictoryModal } from '../components/VictoryModal';
import { sound } from '../lib/sound';
import {
  ArrowLeft,
  Globe,
  Radio,
  X,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface MatchmakingPageProps {
  profile: UserProfile;
  onReturnToMenu: () => void;
}

export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({
  profile,
  onReturnToMenu,
}) => {
  const [status, setStatus] = useState<'searching' | 'matched' | 'playing'>('searching');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [matchData, setMatchData] = useState<OnlineMatchData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Presence & 30s Disconnect State
  const [opponentOnline, setOpponentOnline] = useState(true);
  const [reconnectRemainingSeconds, setReconnectRemainingSeconds] = useState<number | null>(null);

  const activeChannelRef = useRef<ReturnType<typeof matchmakingService.subscribeToMatch>>(null);
  const matchChannelRef = useRef<ReturnType<typeof onlineGameService.subscribeToMatch>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Search Timer
  useEffect(() => {
    if (status === 'searching') {
      const interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Start Matchmaking Queue
  useEffect(() => {
    let isCancelled = false;

    async function startMatchmaking() {
      if (!isSupabaseConfigured()) {
        setErrorMsg('Supabase is not configured. Please set up environment variables in .env');
        return;
      }

      try {
        const res = await matchmakingService.joinQueue(profile.id, profile.username);

        if (isCancelled) return;

        if (res.matched && res.matchId) {
          // Immediately paired!
          sound.playWin();
          setStatus('matched');
          const fullMatch = await onlineGameService.getMatch(res.matchId);
          if (fullMatch && !isCancelled) {
            setMatchData(fullMatch);
            setTimeout(() => setStatus('playing'), 1200);
          }
        } else {
          // Queued, listen for incoming opponent
          const sub = matchmakingService.subscribeToMatch(profile.id, async ({ matchId }) => {
            if (isCancelled) return;
            sound.playWin();
            setStatus('matched');
            const fullMatch = await onlineGameService.getMatch(matchId);
            if (fullMatch && !isCancelled) {
              setMatchData(fullMatch);
              setTimeout(() => setStatus('playing'), 1200);
            }
          });
          activeChannelRef.current = sub;
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setErrorMsg((err as Error).message || 'Failed to join matchmaking pool.');
        }
      }
    }

    startMatchmaking();

    return () => {
      isCancelled = true;
      matchmakingService.leaveQueue(profile.id);
      activeChannelRef.current?.unsubscribe();
    };
  }, [profile.id, profile.username]);

  // Cancel Matchmaking
  const handleCancelSearch = async () => {
    await matchmakingService.leaveQueue(profile.id);
    onReturnToMenu();
  };

  // Handle incoming match state update
  const handleMatchUpdate = useCallback((newMatch: OnlineMatchData) => {
    setMatchData((prev) => {
      if (prev && newMatch.moveCount > prev.moveCount) {
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

  // Subscribe to live match channel during gameplay
  useEffect(() => {
    if (status === 'playing' && matchData?.id) {
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

      matchChannelRef.current = channel;

      return () => {
        if (matchData.status === 'active') {
          onlineGameService.recordDisconnect(matchData.id, profile.id);
        }
        channel?.unsubscribe();
      };
    }
  }, [status, matchData?.id, profile.id, handleMatchUpdate, matchData?.status]);

  // 30-Second Reconnection Countdown
  useEffect(() => {
    if (matchData?.reconnectDeadline && matchData.status === 'active') {
      const deadline = new Date(matchData.reconnectDeadline).getTime();

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setReconnectRemainingSeconds(remaining);
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const userSymbol: Player | null = matchData
    ? matchData.playerXId === profile.id
      ? 'X'
      : matchData.playerOId === profile.id
      ? 'O'
      : null
    : null;

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
          onClick={handleCancelSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold transition-colors focus-ring"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
          <Globe className="w-3.5 h-3.5" />
          <span>Global Matchmaking</span>
        </div>

        <div className="w-16" />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="w-full p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. SEARCHING RADAR SCREEN */}
      {status === 'searching' && (
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none text-center space-y-8 my-auto animate-scale-in">
          {/* Pulsing Concentric Radar */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping [animation-duration:3s]" />
            <div className="absolute inset-4 rounded-full border border-indigo-500/30 animate-pulse" />
            <div className="absolute inset-8 rounded-full border border-indigo-500/40" />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Radio className="w-7 h-7 animate-pulse text-indigo-500 dark:text-indigo-300" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Finding Opponent</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scanning matchmaking pool for active tacticians...</p>
            <div className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-3">
              {formatTimer(elapsedSeconds)}
            </div>
          </div>

          <button
            onClick={handleCancelSearch}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all focus-ring"
          >
            <X className="w-4 h-4" />
            <span>Cancel Search</span>
          </button>
        </div>
      )}

      {/* 2. MATCH FOUND BANNER */}
      {status === 'matched' && (
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-xl dark:shadow-none text-center space-y-4 my-auto animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Zap className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Match Found!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">Initializing tactical board...</p>
        </div>
      )}

      {/* 3. LIVE MATCH GAMEPLAY */}
      {status === 'playing' && matchData && gameStateFromOnline && (
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
              onRematch={() => setStatus('searching')}
              onReturnToMenu={onReturnToMenu}
            />
          )}
        </>
      )}
    </div>
  );
};
