// 📍 Location: src/interfaces/IGame.ts
// 🎯 Purpose: Defines what EVERY game must implement
// 🔗 Used by: All game classes, factory, engine

import { Player, PlayerAction, ActionResult } from './IPlayer';

export enum GameStateEnum {
  IDLE = 'idle',
  INITIALIZING = 'initializing', 
  READY = 'ready',
  RUNNING = 'running',
  PAUSED = 'paused',
  ENDED = 'ended',
  ERROR = 'error'
}

export interface GameState {
  status: GameStateEnum;
  startTime?: Date;
  endTime?: Date;
  currentRound?: number;
  currentPlayer?: string;
  gameData?: Record<string, any>;
}

export interface GameMetadata {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy ' | 'medium' | 'hard' | 'expert';
  estimatedDuration: number; // in minutes
  maxPlayers: number;
  minPlayers: number;
  tags: string[];
  version: string;
  rules?: string[];
  features?: string[];
}

/**
 * 🎯 The Master Contract - Every Game Must Implement This
 * 
 * This interface defines the universal contract that ALL games must follow.
 * It ensures polymorphism, allowing any game to be treated uniformly.
 */
export interface IGame {
  // Core Properties
  gameId: string;
  
  // Lifecycle methods - The heartbeat of every game
  initialize(): Promise<void>;
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  end(): Promise<void>;
  
  // Game state methods - Know what's happening
  getScore(): number | Record<string, number>;
  getState(): GameState;
  getMetadata(): GameMetadata;
  
  // Player management - Who's playing?
  getPlayers(): Player[];
  addPlayer(player: Player): boolean;
  removePlayer(playerId: string): boolean;
  
  // Action processing - The game engine
  handlePlayerAction(action: PlayerAction): Promise<ActionResult>;
  
  // Event system - Communication bridge
  on(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
  off(event: string, callback?: Function): void;
  
  // Validation - Ensure integrity
  validateAction(action: PlayerAction): boolean;
  canStart(): boolean;
  
  // Persistence - Save and load
  serialize(): Promise<string>;
  deserialize(data: string): Promise<void>;
}

/**
 * 🎪 Extended Game Interface for Advanced Features
 * 
 * Optional extensions for games that need additional capabilities
 */
export interface IAdvancedGame extends IGame {
  // Multiplayer features
  syncGameState(state: GameState): Promise<void>;
  broadcastToPlayers(event: string, data: any): void;
  
  // Tournament support
  supportsTournament(): boolean;
  getTournamentData(): Record<string, any>;
  
  // Real-time features
  getGameTime(): number;
  setGameTime(time: number): void;
  
  // Custom rules
  applyCustomRules(rules: Record<string, any>): void;
  getCustomRules(): Record<string, any>;
}
