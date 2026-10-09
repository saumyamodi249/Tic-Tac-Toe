export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[]; // Array of length 9

export type MatchStatus = 'waiting' | 'active' | 'won' | 'draw' | 'abandoned';

export type WinningLine = [number, number, number];

export interface DrawOffer {
  offeredBy: Player;
  createdAt: number; // Timestamp or turn number
}

export interface MoveRecord {
  player: Player;
  cellIndex: number;
  removedCellIndex: number | null;
  moveNumber: number;
  timestamp: number;
}

export interface PlayerHistory {
  marks: number[]; // Array of cell indices currently occupied by player, in chronological order [oldest, middle, newest]
}

export interface GameState {
  board: BoardState;
  currentTurn: Player;
  startingPlayer: Player;
  status: MatchStatus;
  winner: Player | null;
  winningLine: WinningLine | null;
  marksHistory: {
    X: number[]; // Chronological active marks (max length 3)
    O: number[]; // Chronological active marks (max length 3)
  };
  moveHistory: MoveRecord[];
  drawOffer: DrawOffer | null;
  moveCount: number;
}

export interface MoveResult {
  success: boolean;
  newState?: GameState;
  error?: string;
  removedCellIndex?: number | null;
}
