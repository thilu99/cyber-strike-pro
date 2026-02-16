export type GamePhase = 'OVERLAY' | 'PLAYING' | 'FINISHED';

export interface Puzzle {
  letters: string[];
  words: string[];
}

export interface GameState {
  turnIndex: number;
  phase: GamePhase;
  scores: { p1: number; p2: number };
}

export type Action = 
  | { type: 'START_TURN' }
  | { type: 'END_TURN'; points?: number }
  | { type: 'RESET_GAME' };