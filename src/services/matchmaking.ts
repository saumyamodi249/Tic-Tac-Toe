import { supabase, isSupabaseConfigured } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MatchmakingResult {
  matched: boolean;
  roomId?: string;
  roomCode?: string;
  matchId?: string;
}

export const matchmakingService = {
  /**
   * Enters the matchmaking pool or gets paired with an existing queued player
   */
  async joinQueue(playerId: string, playerName: string): Promise<MatchmakingResult> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
    }

    const { data, error } = await supabase.rpc('join_matchmaking_rpc', {
      p_player_id: playerId,
      p_player_name: playerName,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      matched: Boolean(data.matched),
      roomId: data.room_id,
      roomCode: data.room_code,
      matchId: data.match_id,
    };
  },

  /**
   * Leaves the matchmaking pool
   */
  async leaveQueue(playerId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.rpc('leave_matchmaking_rpc', {
        p_player_id: playerId,
      });
    } catch (err) {
      console.warn('Failed to leave queue cleanly:', err);
    }
  },

  /**
   * Subscribes to matchmaking queue notifications for this player
   */
  subscribeToMatch(
    playerId: string,
    onMatched: (result: { roomId: string; roomCode: string; matchId: string }) => void
  ): RealtimeChannel | null {
    if (!isSupabaseConfigured()) return null;

    // Listen to matches table where player is either player_x or player_o
    const channel = supabase
      .channel(`matchmaking_${playerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
        },
        async (payload) => {
          const match = payload.new as Record<string, unknown>;
          if (match.player_x_id === playerId || match.player_o_id === playerId) {
            // Fetch room code
            const { data: room } = await supabase
              .from('rooms')
              .select('code')
              .eq('id', match.room_id)
              .single();

            onMatched({
              roomId: match.room_id as string,
              roomCode: (room?.code as string) || '',
              matchId: match.id as string,
            });
          }
        }
      )
      .subscribe();

    return channel;
  },
};
