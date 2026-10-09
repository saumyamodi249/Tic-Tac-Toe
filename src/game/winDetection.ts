import { BoardState, Player, WinningLine } from './types';

export const WINNING_COMBINATIONS: WinningLine[] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export interface WinResult {
  winner: Player | null;
  winningLine: WinningLine | null;
}

/**
 * Evaluates the board and returns the winner and winning line if present.
 */
export function checkWin(board: BoardState): WinResult {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    const valA = board[a];
    const valB = board[b];
    const valC = board[c];

    if (valA !== null && valA === valB && valA === valC) {
      return {
        winner: valA,
        winningLine: combination,
      };
    }
  }

  return {
    winner: null,
    winningLine: null,
  };
}
