// 📍 Location: src/interfaces/IPlayer.ts
// 🎯 Purpose: Player management and action processing contracts
// 🔗 Used by: IGame, all game implementations

/**
 * 👤 Player Representation
 * 
 * Universal player interface that works across all games
 */
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  stats?: PlayerStats;
  isActive: boolean;
  joinedAt: Date;
  lastActiveAt?: Date;
  preferences?: PlayerPreferences;
  metadata?: Record<string, any>;
}

/**
 * 📊 Player Statistics
 * 
 * Track performance across games and sessions
 */
export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number; // in minutes
  streaks?: {
    current: number;
    best: number;
  };
  achievements?: string[];
  rankingPoints?: number;
  level?: number;
}

/**
 * ⚙️ Player Preferences
 * 
 * Customize player experience
 */
export interface PlayerPreferences {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  soundEnabled: boolean;
  musicEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  showHints: boolean;
  autoSave: boolean;
}

/**
 * 🎮 Player Action
 * 
 * Universal action format for all player interactions
 */
export interface PlayerAction {
  // Core identifiers
  playerId: string;
  actionId: string;
  sessionId?: string;
  
  // Action details
  actionType: string; // 'move', 'answer', 'select', 'submit', etc.
  actionData: Record<string, any>; // Game-specific data
  
  // Timing
  timestamp: Date;
  gameTime?: number; // Time within the game
  
  // Context
  gameState?: string; // What state was the game in
  metadata?: Record<string, any>;
  
  // Validation
  checksum?: string; // For anti-cheat
  clientVersion?: string;
}

/**
 * ✅ Action Result
 * 
 * Universal response format for processed actions
 */
export interface ActionResult {
  // Result status
  success: boolean;
  actionId: string;
  
  // Response data
  result?: any;
  scoreChange?: number;
  newScore?: number | Record<string, number>;
  
  // Game updates
  gameStateChanged?: boolean;
  nextAction?: string;
  
  // Feedback
  message?: string;
  feedback?: ActionFeedback;
  
  // Events to emit
  events?: GameEvent[];
  
  // Timing
  processedAt: Date;
  processingTime?: number; // in milliseconds
  
  // Error handling
  error?: ActionError;
  warnings?: string[];
}

/**
 * 💬 Action Feedback
 * 
 * Rich feedback for player actions
 */
export interface ActionFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: string;
  color?: string;
  sound?: string;
  animation?: string;
  duration?: number; // display duration in ms
}

/**
 * 🎉 Game Event
 * 
 * Events that occur during gameplay
 */
export interface GameEvent {
  eventType: string;
  eventData: any;
  targetPlayers?: string[]; // specific players or all if empty
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

/**
 * ❌ Action Error
 * 
 * Detailed error information for failed actions
 */
export interface ActionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  suggestedAction?: string;
}

/**
 * 👥 Player Manager Interface
 * 
 * Manages players within a game session
 */
export interface IPlayerManager {
  // Player lifecycle
  addPlayer(player: Player): Promise<boolean>;
  removePlayer(playerId: string): Promise<boolean>;
  updatePlayer(playerId: string, updates: Partial<Player>): Promise<boolean>;
  
  // Player queries
  getPlayer(playerId: string): Player | null;
  getAllPlayers(): Player[];
  getActivePlayers(): Player[];
  getPlayerCount(): number;
  
  // Player actions
  processPlayerAction(action: PlayerAction): Promise<ActionResult>;
  validatePlayerAction(action: PlayerAction): boolean;
  
  // Player stats
  updatePlayerStats(playerId: string, stats: Partial<PlayerStats>): Promise<void>;
  getPlayerStats(playerId: string): PlayerStats | null;
  
  // Player preferences
  updatePlayerPreferences(playerId: string, preferences: Partial<PlayerPreferences>): Promise<void>;
  getPlayerPreferences(playerId: string): PlayerPreferences | null;
  
  // Events
  on(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
}
