import { GameState, MoveRecord, MoveResult, Player, BoardState, MatchStatus } from './types';
import { checkWin } from './winDetection';

/**
 * Creates a fresh, initial game state.
 * @param startingPlayer Optional starting player. If omitted, chosen randomly with equal probability.
 */
export function createInitialGameState(startingPlayer?: Player): GameState {
  const chosenStarter: Player = startingPlayer ?? (Math.random() < 0.5 ? 'X' : 'O');
  
  return {
    board: Array(9).fill(null),
    currentTurn: chosenStarter,
    startingPlayer: chosenStarter,
    status: 'active',
    winner: null,
    winningLine: null,
    marksHistory: {
      X: [],
      O: [],
    },
    moveHistory: [],
    drawOffer: null,
    moveCount: 0,
  };
}

/**
 * Validates and executes a move in the game.
 * Follows the atomic three-mark rule:
 * 1. Validate cell and turn.
 * 2. If current player already has 3 marks, remove the oldest mark.
 * 3. Place new mark in the chosen empty cell.
 * 4. Update chronological marks history.
 * 5. Check winning lines.
 * 6. If no winner, switch turn.
 */
export function makeMove(
  state: GameState,
  cellIndex: number,
  player?: Player
): MoveResult {
  // 1. Validate game status
  if (state.status !== 'active') {
    return {
      success: false,
      error: `Cannot make a move in a match with status '${state.status}'`,
    };
  }

  // 2. Validate cell index bounds
  if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex > 8) {
    return {
      success: false,
      error: `Invalid cell index: ${cellIndex}. Must be an integer between 0 and 8.`,
    };
  }

  // 3. Validate turn
  const actingPlayer = state.currentTurn;
  if (player && player !== actingPlayer) {
    return {
      success: false,
      error: `It is Player ${actingPlayer}'s turn, but Player ${player} attempted to move.`,
    };
  }

  // 4. Validate cell is empty
  if (state.board[cellIndex] !== null) {
    return {
      success: false,
      error: `Cell ${cellIndex} is already occupied.`,
    };
  }

  // 5. Clone board and player marks history for immutable update
  const newBoard: BoardState = [...state.board];
  const playerMarks = [...state.marksHistory[actingPlayer]];
  let removedCellIndex: number | null = null;

  // 6. If player already has 3 marks, remove the oldest mark
  if (playerMarks.length >= 3) {
    removedCellIndex = playerMarks.shift()!;
    newBoard[removedCellIndex] = null;
  }

  // 7. Place the new mark
  newBoard[cellIndex] = actingPlayer;
  playerMarks.push(cellIndex);

  // 8. Construct updated marks history
  const newMarksHistory = {
    ...state.marksHistory,
    [actingPlayer]: playerMarks,
  };

  // 9. Evaluate win conditions on the completed board
  const { winner, winningLine } = checkWin(newBoard);

  // 10. Construct move record
  const moveRecord: MoveRecord = {
    player: actingPlayer,
    cellIndex,
    removedCellIndex,
    moveNumber: state.moveCount + 1,
    timestamp: Date.now(),
  };

  // 11. Determine next status and turn
  let nextStatus: MatchStatus = state.status;
  let nextTurn: Player = state.currentTurn;

  if (winner) {
    nextStatus = 'won';
  } else {
    nextTurn = actingPlayer === 'X' ? 'O' : 'X';
  }

  const newState: GameState = {
    ...state,
    board: newBoard,
    currentTurn: nextTurn,
    status: nextStatus,
    winner: winner ?? null,
    winningLine: winningLine ?? null,
    marksHistory: newMarksHistory,
    moveHistory: [...state.moveHistory, moveRecord],
    drawOffer: null, // Clear any pending draw offer on move
    moveCount: state.moveCount + 1,
  };

  return {
    success: true,
    newState,
    removedCellIndex,
  };
}

/**
 * Creates a draw offer from a player.
 */
export function offerDraw(state: GameState, player: Player): MoveResult {
  if (state.status !== 'active') {
    return {
      success: false,
      error: `Cannot offer a draw when match status is '${state.status}'`,
    };
  }

  if (state.drawOffer && state.drawOffer.offeredBy === player) {
    return {
      success: false,
      error: `Player ${player} already has a pending draw offer.`,
    };
  }

  // If opponent already offered draw, treat this as acceptance
  if (state.drawOffer && state.drawOffer.offeredBy !== player) {
    return acceptDraw(state, player);
  }

  const newState: GameState = {
    ...state,
    drawOffer: {
      offeredBy: player,
      createdAt: Date.now(),
    },
  };

  return {
    success: true,
    newState,
  };
}

/**
 * Accepts an active draw offer made by the opponent.
 */
export function acceptDraw(state: GameState, player: Player): MoveResult {
  if (state.status !== 'active') {
    return {
      success: false,
      error: `Cannot accept draw when match status is '${state.status}'`,
    };
  }

  if (!state.drawOffer) {
    return {
      success: false,
      error: 'No active draw offer to accept.',
    };
  }

  if (state.drawOffer.offeredBy === player) {
    return {
      success: false,
      error: 'Cannot accept your own draw offer.',
    };
  }

  const newState: GameState = {
    ...state,
    status: 'draw',
    drawOffer: null,
  };

  return {
    success: true,
    newState,
  };
}

/**
 * Declines an active draw offer.
 */
export function declineDraw(state: GameState, player: Player): MoveResult {
  if (!state.drawOffer) {
    return {
      success: false,
      error: 'No active draw offer to decline.',
    };
  }

  if (state.drawOffer.offeredBy === player) {
    return {
      success: false,
      error: 'Cannot decline your own draw offer. Wait for opponent to respond.',
    };
  }

  const newState: GameState = {
    ...state,
    drawOffer: null,
  };

  return {
    success: true,
    newState,
  };
}

/**
 * Gets the index of the oldest mark for a given player if they have 3 marks.
 * Returns null if the player has fewer than 3 marks.
 */
export function getOldestMarkIndex(state: GameState, player: Player): number | null {
  const marks = state.marksHistory[player];
  if (marks && marks.length >= 3) {
    return marks[0];
  }
  return null;
}

/**
 * Gets the relative age of a mark at cellIndex for player (1 = oldest, 2 = middle, 3 = newest).
 * Returns null if the cell does not belong to the player.
 */
export function getMarkOrder(state: GameState, cellIndex: number): { player: Player; order: number; isOldest: boolean } | null {
  const cellVal = state.board[cellIndex];
  if (!cellVal) return null;

  const marks = state.marksHistory[cellVal];
  const indexInHistory = marks.indexOf(cellIndex);
  if (indexInHistory === -1) return null;

  const totalMarks = marks.length;
  // order 1 = oldest placed, 2 = middle, 3 = newest placed
  const order = indexInHistory + 1;
  const isOldest = indexInHistory === 0 && totalMarks === 3;

  return {
    player: cellVal,
    order,
    isOldest,
  };
}
