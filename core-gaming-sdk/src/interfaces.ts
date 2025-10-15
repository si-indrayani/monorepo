// Core Gaming SDK Interfaces
// Based on the proposed gaming architecture

/** Universal Player representation */
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  stats?: Record<string, any>;
  isActive: boolean;
}

/** Game metadata information */
export interface GameMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  category?: string;
  tags?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  estimatedDuration?: number; // in minutes
}

/** Game state enumeration */
export enum GameStateEnum {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ENDED = 'ended',
  ERROR = 'error'
}

/** Game state tracking */
export interface GameState {
  status: GameStateEnum;
  startTime?: Date;
  endTime?: Date;
  currentRound?: number;
  totalRounds?: number;
  metadata?: Record<string, any>;
}

/** Player action representation */
export interface PlayerAction {
  playerId: string;
  actionType: string;
  actionData: Record<string, any>;
  timestamp: Date;
}

/** Action processing result */
export interface ActionResult {
  success: boolean;
  score?: number | Record<string, number>;
  feedback?: string;
  gameState?: Partial<GameState>;
  nextAction?: string;
  metadata?: Record<string, any>;
}

/** Universal Game Interface - Every game must implement this */
export interface IGame {
  // Basic properties
  readonly gameId: string;
  readonly metadata: GameMetadata;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  end(): Promise<void>;
  
  // Game state methods
  getScore(): number | Record<string, number>;
  getState(): GameState;
  getMetadata(): GameMetadata;
  
  // Player management
  getPlayers(): Player[];
  addPlayer(player: Player): boolean;
  removePlayer(playerId: string): boolean;
  
  // Action processing
  handlePlayerAction(action: PlayerAction): Promise<ActionResult>;
  
  // Event handling
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, data?: any): void;
}

/** Game configuration rules */
export interface GameRules {
  maxDuration?: number; // in minutes
  maxRounds?: number;
  customRules?: Record<string, any>;
}

/** UI configuration */
export interface UIConfig {
  theme?: Record<string, any>;
  layout?: string;
  customStyles?: Record<string, any>;
}

/** Storage configuration */
export interface StorageConfig {
  persistent?: boolean;
  key?: string;
  strategy?: 'localStorage' | 'sessionStorage' | 'memory';
}

/** Universal game configuration */
export interface GameConfig {
  gameId: string;
  metadata: GameMetadata;
  scoringRules: Record<string, number>;
  gameRules: GameRules;
  ui: UIConfig;
  storage: StorageConfig;
}

/** Game SDK loading options */
export interface GameSDKOptions {
  baseUrl?: string;
  version?: string;
  timeout?: number;
  retryAttempts?: number;
}

/** Game SDK information from server */
export interface GameSDKInfo {
  gameId: string;
  sdkUrl: string;
  version: string;
  config: GameConfig;
  dependencies?: string[];
}

/** Core Gaming SDK Events */
export type CoreGamingEvents = {
  'sdk:initialized': null;
  'game:discovered': { gameId: string; config: GameConfig };
  'game:loading': { gameId: string };
  'game:loaded': { gameId: string; game: IGame };
  'game:error': { gameId: string; error: Error };
  'session:created': { sessionId: string; gameId: string };
  'session:ended': { sessionId: string; result?: any };
};

export type CoreGamingEventName = keyof CoreGamingEvents;
