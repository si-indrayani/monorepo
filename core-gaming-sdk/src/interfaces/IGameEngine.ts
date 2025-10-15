// 📍 Location: src/interfaces/IGameEngine.ts
// 🎯 Purpose: Game engine orchestration interface
// 🔗 Used by: GameEngine implementation

import { IGame } from './IGame';
import { Player, PlayerAction, ActionResult } from './IPlayer';
import { GameConfig } from '../config/GameConfig';

/**
 * 🎮 Game Session
 * 
 * Represents an active game session
 */
export interface GameSession {
  sessionId: string;
  gameId: string;
  gameType: string;
  game: IGame;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
  status: 'created' | 'active' | 'paused' | 'completed' | 'error';
  metadata?: Record<string, any>;
}

/**
 * 🎯 Engine Configuration
 * 
 * Configuration for the game engine
 */
export interface EngineConfig {
  maxConcurrentSessions: number;
  sessionTimeout: number; // in minutes
  autoCleanup: boolean;
  persistSessions: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsEnabled: boolean;
  crashReporting: boolean;
}

/**
 * 📊 Engine Metrics
 * 
 * Performance and usage metrics
 */
export interface EngineMetrics {
  activeSessions: number;
  totalSessionsCreated: number;
  totalPlayersActive: number;
  averageSessionDuration: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  lastUpdated: Date;
}

/**
 * 🎮 Game Engine Interface
 * 
 * The master orchestrator that manages the entire gaming platform
 */
export interface IGameEngine {
  // Engine lifecycle
  initialize(config: EngineConfig): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  
  // Session management - The core functionality
  createGameSession(gameType: string, sessionId?: string, options?: any): Promise<GameSession>;
  getGameSession(sessionId: string): GameSession | null;
  getAllSessions(): GameSession[];
  destroyGameSession(sessionId: string): Promise<boolean>;
  
  // Game operations - Universal game control
  startGame(sessionId: string): Promise<void>;
  pauseGame(sessionId: string): Promise<void>;
  resumeGame(sessionId: string): Promise<void>;
  endGame(sessionId: string): Promise<void>;
  
  // Player management - Cross-session player operations
  addPlayerToSession(sessionId: string, player: Player): Promise<boolean>;
  removePlayerFromSession(sessionId: string, playerId: string): Promise<boolean>;
  movePlayerBetweenSessions(playerId: string, fromSession: string, toSession: string): Promise<boolean>;
  
  // Action processing - The heart of gameplay
  processPlayerAction(sessionId: string, action: PlayerAction): Promise<ActionResult>;
  broadcastToSession(sessionId: string, event: string, data: any): Promise<void>;
  broadcastToAllSessions(event: string, data: any): Promise<void>;
  
  // Game discovery and management
  getAvailableGameTypes(): Promise<string[]>;
  getGameConfig(gameType: string): Promise<GameConfig | null>;
  registerGameType(gameType: string, gameClass: any): void;
  unregisterGameType(gameType: string): void;
  
  // Monitoring and health
  getEngineMetrics(): EngineMetrics;
  getEngineStatus(): EngineStatus;
  healthCheck(): Promise<HealthCheckResult>;
  
  // Event system - Engine-wide events
  on(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
  off(event: string, callback?: Function): void;
  
  // Persistence - Save and restore engine state
  saveEngineState(): Promise<string>;
  loadEngineState(data: string): Promise<void>;
  
  // Advanced features
  createTournament(gameType: string, players: Player[], config?: any): Promise<string>;
  getActiveTournaments(): Promise<TournamentSession[]>;
  scheduleGameSession(gameType: string, scheduledTime: Date, options?: any): Promise<string>;
}

/**
 * 🏥 Engine Status
 * 
 * Current status of the game engine
 */
export interface EngineStatus {
  isRunning: boolean;
  uptime: number; // in milliseconds
  version: string;
  activeSessions: number;
  totalPlayers: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  lastError?: {
    message: string;
    timestamp: Date;
    stack?: string;
  };
}

/**
 * 🏥 Health Check Result
 * 
 * Result of engine health check
 */
export interface HealthCheckResult {
  healthy: boolean;
  timestamp: Date;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration: number; // in milliseconds
  }[];
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * 🏆 Tournament Session
 * 
 * Represents a tournament session
 */
export interface TournamentSession {
  tournamentId: string;
  gameType: string;
  players: Player[];
  status: 'created' | 'active' | 'completed' | 'cancelled';
  rounds: TournamentRound[];
  winner?: Player;
  createdAt: Date;
  completedAt?: Date;
  config: any;
}

/**
 * 🏆 Tournament Round
 * 
 * Individual round within a tournament
 */
export interface TournamentRound {
  roundId: string;
  roundNumber: number;
  matches: TournamentMatch[];
  status: 'pending' | 'active' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * 🏆 Tournament Match
 * 
 * Individual match within a tournament round
 */
export interface TournamentMatch {
  matchId: string;
  sessionId: string;
  players: Player[];
  winner?: Player;
  score?: Record<string, number>;
  status: 'pending' | 'active' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * 📝 Engine Event Types
 * 
 * Standard events emitted by the game engine
 */
export enum EngineEventType {
  // Engine lifecycle
  ENGINE_STARTED = 'engine:started',
  ENGINE_STOPPED = 'engine:stopped',
  ENGINE_ERROR = 'engine:error',
  
  // Session events
  SESSION_CREATED = 'session:created',
  SESSION_STARTED = 'session:started',
  SESSION_ENDED = 'session:ended',
  SESSION_ERROR = 'session:error',
  
  // Player events
  PLAYER_JOINED = 'player:joined',
  PLAYER_LEFT = 'player:left',
  PLAYER_ACTION = 'player:action',
  
  // Game events
  GAME_STATE_CHANGED = 'game:state:changed',
  GAME_SCORE_UPDATED = 'game:score:updated',
  GAME_COMPLETED = 'game:completed',
  
  // System events
  METRICS_UPDATED = 'metrics:updated',
  HEALTH_CHECK_COMPLETED = 'health:check:completed',
  CLEANUP_COMPLETED = 'cleanup:completed'
}
