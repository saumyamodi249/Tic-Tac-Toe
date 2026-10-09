import { supabase, isSupabaseConfigured } from './supabase';
import { Player, WinningLine } from '../game/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface OnlineMatchData {
  id: string;
  roomId: string;
  playerXId: string;
  playerXName: string;
  playerOId: string;
  playerOName: string;
  startingPlayer: Player;
  currentTurn: Player;
  status: 'active' | 'won' | 'draw' | 'abandoned';
  winnerId: string | null;
  winnerSymbol: Player | null;
  winningLine: WinningLine | null;
  boardState: (Player | null)[];
  xMarks: number[];
  oMarks: number[];
  drawOfferedBy: string | null;
  rematchRequestedBy: string | null;
  moveCount: number;
  version: number;
  disconnectedPlayerId: string | null;
  reconnectDeadline: string | null;
}

export interface RoomData {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  guestId: string | null;
  guestName: string | null;
  status: 'waiting' | 'playing' | 'finished' | 'closed';
}

function mapRowToMatch(row: Record<string, unknown>): OnlineMatchData {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    playerXId: row.player_x_id as string,
    playerXName: row.player_x_name as string,
    playerOId: row.player_o_id as string,
    playerOName: row.player_o_name as string,
    startingPlayer: row.starting_player as Player,
    currentTurn: row.current_turn as Player,
    status: row.status as OnlineMatchData['status'],
    winnerId: (row.winner_id as string) || null,
    winnerSymbol: (row.winner_symbol as Player) || null,
    winningLine: (row.winning_line as WinningLine) || null,
    boardState: (row.board_state as (Player | null)[]) || Array(9).fill(null),
    xMarks: (row.x_marks as number[]) || [],
    oMarks: (row.o_marks as number[]) || [],
    drawOfferedBy: (row.draw_offered_by as string) || null,
    rematchRequestedBy: (row.rematch_requested_by as string) || null,
    moveCount: Number(row.move_count || 0),
    version: Number(row.version || 1),
    disconnectedPlayerId: (row.disconnected_player_id as string) || null,
    reconnectDeadline: (row.reconnect_deadline as string) || null,
  };
}

export const onlineGameService = {
  /**
   * Creates a private room on Supabase
   */
  async createRoom(playerId: string, playerName: string): Promise<{ roomId: string; roomCode: string } | null> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up environment variables in .env');
    }

    const { data, error } = await supabase.rpc('create_private_room', {
      p_player_id: playerId,
      p_player_name: playerName,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      roomId: data.room_id,
      roomCode: data.room_code,
    };
  },

  /**
   * Joins a private room with a 6-character room code
   */
  async joinRoom(roomCode: string, playerId: string, playerName: string): Promise<{ roomId: string; matchId: string; roomCode: string } | null> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up environment variables in .env');
    }

    const { data, error } = await supabase.rpc('join_private_room', {
      p_room_code: roomCode.trim().toUpperCase(),
      p_player_id: playerId,
      p_player_name: playerName,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      roomId: data.room_id,
      matchId: data.match_id,
      roomCode: data.room_code,
    };
  },

  /**
   * Fetches latest match by ID
   */
  async getMatch(matchId: string): Promise<OnlineMatchData | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error || !data) return null;
    return mapRowToMatch(data);
  },

  /**
   * Fetches active match by Room ID
   */
  async getMatchByRoomId(roomId: string): Promise<OnlineMatchData | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return mapRowToMatch(data);
  },

  /**
   * Submits a move atomically via Supabase server function
   */
  async submitMove(
    matchId: string,
    playerId: string,
    cellIndex: number,
    expectedVersion: number
  ): Promise<{ success: boolean; removedCellIndex?: number | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const { data, error } = await supabase.rpc('submit_online_move', {
      p_match_id: matchId,
      p_player_id: playerId,
      p_cell_index: cellIndex,
      p_expected_version: expectedVersion,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      removedCellIndex: data.removed_cell_index,
    };
  },

  /**
   * Proposes a mutual draw
   */
  async offerDraw(matchId: string, playerId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.rpc('offer_draw_rpc', {
      p_match_id: matchId,
      p_player_id: playerId,
    });
    return !error;
  },

  /**
   * Responds to an opponent's draw offer
   */
  async respondDraw(matchId: string, playerId: string, accept: boolean): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const { error } = await supabase.rpc('respond_draw_rpc', {
      p_match_id: matchId,
      p_player_id: playerId,
      p_accept: accept,
    });
    return !error;
  },

  /**
   * Records player disconnect to initiate 30s countdown
   */
  async recordDisconnect(matchId: string, playerId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.rpc('record_disconnect_rpc', {
        p_match_id: matchId,
        p_player_id: playerId,
      });
    } catch {
      // Ignore network teardown errors
    }
  },

  /**
   * Records player reconnection to cancel 30s deadline
   */
  async recordReconnect(matchId: string, playerId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.rpc('record_reconnect_rpc', {
        p_match_id: matchId,
        p_player_id: playerId,
      });
    } catch {
      // Ignore
    }
  },

  /**
   * Claims forfeit win after 30s deadline has passed
   */
  async claimForfeit(matchId: string, playerId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    const { error } = await supabase.rpc('claim_forfeit_rpc', {
      p_match_id: matchId,
      p_player_id: playerId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Subscribes to match changes and presence
   */
  subscribeToMatch(
    matchId: string,
    playerId: string,
    onMatchUpdate: (match: OnlineMatchData) => void,
    onOpponentStatusChange?: (isOnline: boolean) => void
  ): RealtimeChannel | null {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase.channel(`match_${matchId}`, {
      config: {
        presence: {
          key: playerId,
        },
      },
    });

    // Listen to PostgreSQL database row changes
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => {
        if (payload.new) {
          onMatchUpdate(mapRowToMatch(payload.new as Record<string, unknown>));
        }
      }
    );

    // Track presence heartbeats
    if (onOpponentStatusChange) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const keys = Object.keys(state);
        const hasOther = keys.some((k) => k !== playerId);
        onOpponentStatusChange(hasOther);
      });

      channel.on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== playerId) {
          onOpponentStatusChange(false);
        }
      });
    }

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return channel;
  },

  /**
   * Subscribes to room updates (e.g. for host waiting for guest)
   */
  subscribeToRoom(roomId: string, onRoomUpdate: (room: RoomData) => void): RealtimeChannel | null {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase.channel(`room_${roomId}`);

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new) {
          const r = payload.new as Record<string, unknown>;
          onRoomUpdate({
            id: r.id as string,
            code: r.code as string,
            hostId: r.host_id as string,
            hostName: r.host_name as string,
            guestId: (r.guest_id as string) || null,
            guestName: (r.guest_name as string) || null,
            status: r.status as RoomData['status'],
          });
        }
      }
    );

    channel.subscribe();
    return channel;
  },
};
