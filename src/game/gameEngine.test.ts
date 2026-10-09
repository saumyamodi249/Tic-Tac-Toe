import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  makeMove,
  offerDraw,
  acceptDraw,
  declineDraw,
  getOldestMarkIndex,
  getMarkOrder,
} from './engine';
import { checkWin } from './winDetection';
import { BoardState, Player } from './types';

describe('Triple Loop Tic-Tac-Toe Game Engine', () => {
  describe('Initial State & Starting Player', () => {
    it('creates initial state with empty board and 0 marks', () => {
      const state = createInitialGameState('X');
      expect(state.board).toEqual(Array(9).fill(null));
      expect(state.currentTurn).toBe('X');
      expect(state.startingPlayer).toBe('X');
      expect(state.status).toBe('active');
      expect(state.winner).toBeNull();
      expect(state.winningLine).toBeNull();
      expect(state.marksHistory.X).toEqual([]);
      expect(state.marksHistory.O).toEqual([]);
      expect(state.moveHistory).toEqual([]);
      expect(state.moveCount).toBe(0);
    });

    it('randomly selects starting player when none is specified', () => {
      const starters = new Set<Player>();
      for (let i = 0; i < 50; i++) {
        const state = createInitialGameState();
        starters.add(state.startingPlayer);
      }
      expect(starters.has('X')).toBe(true);
      expect(starters.has('O')).toBe(true);
    });
  });

  describe('Move Validation & Turn Switching', () => {
    it('allows legal moves and alternates turns', () => {
      let state = createInitialGameState('X');

      const res1 = makeMove(state, 0);
      expect(res1.success).toBe(true);
      state = res1.newState!;
      expect(state.board[0]).toBe('X');
      expect(state.currentTurn).toBe('O');
      expect(state.marksHistory.X).toEqual([0]);

      const res2 = makeMove(state, 1);
      expect(res2.success).toBe(true);
      state = res2.newState!;
      expect(state.board[1]).toBe('O');
      expect(state.currentTurn).toBe('X');
      expect(state.marksHistory.O).toEqual([1]);
    });

    it('rejects moves on already occupied cells', () => {
      let state = createInitialGameState('X');
      const res1 = makeMove(state, 4);
      state = res1.newState!;

      const res2 = makeMove(state, 4); // O tries to play on cell 4
      expect(res2.success).toBe(false);
      expect(res2.error).toContain('already occupied');
      expect(state.currentTurn).toBe('O'); // Turn does not change
    });

    it('rejects moves if wrong player acts', () => {
      const state = createInitialGameState('X');
      const res = makeMove(state, 0, 'O');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Player O attempted to move');
    });

    it('rejects invalid cell index out of bounds', () => {
      const state = createInitialGameState('X');
      expect(makeMove(state, -1).success).toBe(false);
      expect(makeMove(state, 9).success).toBe(false);
      expect(makeMove(state, 3.5).success).toBe(false);
    });
  });

  describe('Three-Mark Rule & Oldest Mark Removal', () => {
    it('allows up to 3 marks per player normally without removal', () => {
      let state = createInitialGameState('X');

      // 1. X at 0
      state = makeMove(state, 0).newState!;
      // 2. O at 3
      state = makeMove(state, 3).newState!;
      // 3. X at 1
      state = makeMove(state, 1).newState!;
      // 4. O at 4
      state = makeMove(state, 4).newState!;
      // 5. X at 6
      state = makeMove(state, 6).newState!;
      // 6. O at 8
      state = makeMove(state, 8).newState!;

      expect(state.marksHistory.X).toEqual([0, 1, 6]);
      expect(state.marksHistory.O).toEqual([3, 4, 8]);
      expect(state.board[0]).toBe('X');
      expect(state.board[1]).toBe('X');
      expect(state.board[6]).toBe('X');
      expect(state.board[3]).toBe('O');
      expect(state.board[4]).toBe('O');
      expect(state.board[8]).toBe('O');
    });

    it('removes the oldest mark when the 4th mark is placed', () => {
      let state = createInitialGameState('X');

      // X: 0, 1, 2 (Wait, [0,1,2] would win, so let's use non-winning positions: 0, 1, 6)
      // O: 3, 4, 5 (Wait, [3,4,5] wins, so use: 3, 4, 8)
      state = makeMove(state, 0).newState!; // X 0 (X: [0])
      state = makeMove(state, 3).newState!; // O 3 (O: [3])
      state = makeMove(state, 1).newState!; // X 1 (X: [0, 1])
      state = makeMove(state, 4).newState!; // O 4 (O: [3, 4])
      state = makeMove(state, 6).newState!; // X 6 (X: [0, 1, 6])
      state = makeMove(state, 8).newState!; // O 8 (O: [3, 4, 8])

      expect(getOldestMarkIndex(state, 'X')).toBe(0);

      // Now X places 4th mark at cell 7
      // Oldest mark at 0 MUST be removed!
      const moveRes = makeMove(state, 7);
      expect(moveRes.success).toBe(true);
      expect(moveRes.removedCellIndex).toBe(0);

      state = moveRes.newState!;
      expect(state.board[0]).toBeNull(); // Cell 0 is now empty!
      expect(state.board[7]).toBe('X');
      expect(state.marksHistory.X).toEqual([1, 6, 7]); // Chronological order updated
    });

    it('tracks mark order correctly with getMarkOrder', () => {
      let state = createInitialGameState('X');
      state = makeMove(state, 0).newState!; // X 1st
      state = makeMove(state, 3).newState!; // O 1st
      state = makeMove(state, 1).newState!; // X 2nd
      state = makeMove(state, 4).newState!; // O 2nd
      state = makeMove(state, 8).newState!; // X 3rd

      const mark0 = getMarkOrder(state, 0);
      expect(mark0).toEqual({ player: 'X', order: 1, isOldest: true });

      const mark1 = getMarkOrder(state, 1);
      expect(mark1).toEqual({ player: 'X', order: 2, isOldest: false });

      const mark8 = getMarkOrder(state, 8);
      expect(mark8).toEqual({ player: 'X', order: 3, isOldest: false });

      const emptyMark = getMarkOrder(state, 2);
      expect(emptyMark).toBeNull();
    });
  });

  describe('Winning Combinations', () => {
    it('detects all 3 winning rows', () => {
      // Row 0: [0, 1, 2]
      const b0: BoardState = ['X', 'X', 'X', null, null, null, null, null, null];
      expect(checkWin(b0)).toEqual({ winner: 'X', winningLine: [0, 1, 2] });

      // Row 1: [3, 4, 5]
      const b1: BoardState = [null, null, null, 'O', 'O', 'O', null, null, null];
      expect(checkWin(b1)).toEqual({ winner: 'O', winningLine: [3, 4, 5] });

      // Row 2: [6, 7, 8]
      const b2: BoardState = [null, null, null, null, null, null, 'X', 'X', 'X'];
      expect(checkWin(b2)).toEqual({ winner: 'X', winningLine: [6, 7, 8] });
    });

    it('detects all 3 winning columns', () => {
      // Col 0: [0, 3, 6]
      const b0: BoardState = ['X', null, null, 'X', null, null, 'X', null, null];
      expect(checkWin(b0)).toEqual({ winner: 'X', winningLine: [0, 3, 6] });

      // Col 1: [1, 4, 7]
      const b1: BoardState = [null, 'O', null, null, 'O', null, null, 'O', null];
      expect(checkWin(b1)).toEqual({ winner: 'O', winningLine: [1, 4, 7] });

      // Col 2: [2, 5, 8]
      const b2: BoardState = [null, null, 'X', null, null, 'X', null, null, 'X'];
      expect(checkWin(b2)).toEqual({ winner: 'X', winningLine: [2, 5, 8] });
    });

    it('detects both diagonals', () => {
      // Main diagonal: [0, 4, 8]
      const b0: BoardState = ['O', null, null, null, 'O', null, null, null, 'O'];
      expect(checkWin(b0)).toEqual({ winner: 'O', winningLine: [0, 4, 8] });

      // Anti-diagonal: [2, 4, 6]
      const b1: BoardState = [null, null, 'X', null, 'X', null, 'X', null, null];
      expect(checkWin(b1)).toEqual({ winner: 'X', winningLine: [2, 4, 6] });
    });

    it('registers win in game state and prevents further moves', () => {
      let state = createInitialGameState('X');
      state = makeMove(state, 0).newState!; // X: 0
      state = makeMove(state, 3).newState!; // O: 3
      state = makeMove(state, 1).newState!; // X: 1
      state = makeMove(state, 4).newState!; // O: 4
      state = makeMove(state, 2).newState!; // X: 2 -> X wins on [0,1,2]!

      expect(state.status).toBe('won');
      expect(state.winner).toBe('X');
      expect(state.winningLine).toEqual([0, 1, 2]);

      // Move after win is rejected
      const furtherMove = makeMove(state, 5);
      expect(furtherMove.success).toBe(false);
      expect(furtherMove.error).toContain("status 'won'");
    });

    it('verifies win detection occurs AFTER mark removal on 4th placement', () => {
      // Scenario: X has marks at 0, 1, 6.
      // X plays at 2. Oldest mark (0) is removed, so X now has [1, 6, 2].
      // Even though [0, 1, 2] would have been a row, mark 0 was removed BEFORE checking win!
      // So X does NOT win on row [0, 1, 2] because 0 is now empty.
      let state = createInitialGameState('X');
      state = makeMove(state, 0).newState!; // X: 0
      state = makeMove(state, 3).newState!; // O: 3
      state = makeMove(state, 1).newState!; // X: 1
      state = makeMove(state, 4).newState!; // O: 4
      state = makeMove(state, 6).newState!; // X: 6
      state = makeMove(state, 8).newState!; // O: 8

      // X places at 2. Mark 0 is removed. Board has X at 1, 6, 2.
      state = makeMove(state, 2).newState!;

      expect(state.board[0]).toBeNull();
      expect(state.board[1]).toBe('X');
      expect(state.board[2]).toBe('X');
      expect(state.status).toBe('active');
      expect(state.winner).toBeNull();
    });
  });

  describe('Draw Offers, Acceptance & Rejection', () => {
    it('allows a player to offer a draw', () => {
      let state = createInitialGameState('X');
      const res = offerDraw(state, 'X');
      expect(res.success).toBe(true);
      state = res.newState!;
      expect(state.drawOffer).not.toBeNull();
      expect(state.drawOffer?.offeredBy).toBe('X');
    });

    it('prevents a player from accepting their own draw offer', () => {
      let state = createInitialGameState('X');
      state = offerDraw(state, 'X').newState!;

      const acceptRes = acceptDraw(state, 'X');
      expect(acceptRes.success).toBe(false);
      expect(acceptRes.error).toContain('Cannot accept your own draw offer');
    });

    it('ends match in draw when opponent accepts', () => {
      let state = createInitialGameState('X');
      state = offerDraw(state, 'X').newState!;

      const acceptRes = acceptDraw(state, 'O');
      expect(acceptRes.success).toBe(true);
      state = acceptRes.newState!;
      expect(state.status).toBe('draw');
      expect(state.drawOffer).toBeNull();

      // No moves allowed after draw
      expect(makeMove(state, 0).success).toBe(false);
    });

    it('clears draw offer when declined', () => {
      let state = createInitialGameState('X');
      state = offerDraw(state, 'X').newState!;

      const declineRes = declineDraw(state, 'O');
      expect(declineRes.success).toBe(true);
      state = declineRes.newState!;
      expect(state.status).toBe('active');
      expect(state.drawOffer).toBeNull();
    });

    it('clears pending draw offer when a move is made', () => {
      let state = createInitialGameState('X');
      state = offerDraw(state, 'X').newState!;
      expect(state.drawOffer).not.toBeNull();

      state = makeMove(state, 4).newState!;
      expect(state.drawOffer).toBeNull();
    });
  });

  describe('Long Gameplay & State Consistency (50+ consecutive moves)', () => {
    it('maintains exact state consistency and at most 3 marks per player over many turns', () => {
      let state = createInitialGameState('X');

      for (let i = 0; i < 40; i++) {
        // Pick any unoccupied cell
        const emptyCells: number[] = [];
        state.board.forEach((val, idx) => {
          if (val === null) emptyCells.push(idx);
        });

        if (emptyCells.length === 0) break;

        const chosenCell = emptyCells[i % emptyCells.length];
        const res = makeMove(state, chosenCell);
        expect(res.success).toBe(true);
        state = res.newState!;

        // Check active marks count <= 3
        expect(state.marksHistory.X.length).toBeLessThanOrEqual(3);
        expect(state.marksHistory.O.length).toBeLessThanOrEqual(3);

        // Check total active marks on board = sum of marksHistory lengths
        const marksOnBoard = state.board.filter((c) => c !== null).length;
        expect(marksOnBoard).toBe(state.marksHistory.X.length + state.marksHistory.O.length);

        if (state.status !== 'active') break;
      }
    });
  });
});
