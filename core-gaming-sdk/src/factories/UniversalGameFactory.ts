// 📍 Location: src/factories/UniversalGameFactory.ts
// 🎯 Purpose: Creates ANY game type (known or unknown) using Factory Pattern
// 🔗 Uses: GameConfigManager, all game classes, scoring strategies

import { IGame } from '../interfaces/IGame';
import { GameConfig, GameConfigManager } from '../config/GameConfig';
import { BaseScoringStrategy, ScoringStrategyFactory } from '../strategies/ScoringStrategy';

/**
 * 🎮 Game Class Constructor Type
 * 
 * Defines the contract for game class constructors
 */
export type GameClass = new (
  gameId: string,
  config: GameConfig,
  scoringStrategy: BaseScoringStrategy,
  options?: any
) => IGame;

/**
 * 🏭 Universal Game Factory
 * 
 * The master factory that can create ANY game type, whether it's:
 * - Known games with specific implementations (Cricket, Football, Quiz)
 * - Unknown games using generic implementation
 * - Custom games with dynamic configuration
 */
export class UniversalGameFactory {
  private gameRegistry: Map<string, GameClass> = new Map();
  private configManager: GameConfigManager;
  private instanceCache: Map<string, IGame> = new Map();

  constructor(configManager?: GameConfigManager) {
    this.configManager = configManager || new GameConfigManager();
    this.registerBuiltInGames();
  }

  /**
   * 🏗️ Factory Method Pattern - Create Game Instance
   * 
   * This is the heart of the factory - it can create ANY game type
   */
  async createGame(gameId: string, options: GameCreationOptions = {}): Promise<IGame> {
    console.log(`🎯 Creating game instance for: ${gameId}`);

    try {
      // 1. Load or create configuration
      let config: GameConfig;
      try {
        config = await this.configManager.loadConfig(gameId);
        console.log(`✅ Loaded existing configuration for ${gameId}`);
      } catch (error) {
        console.log(`📝 Creating new configuration for ${gameId}`);
        config = await this.configManager.initializeNewGame(gameId, options.configOverrides);
      }

      // 2. Create scoring strategy
      const gameType = this.extractGameType(gameId);
      const scoringStrategy = ScoringStrategyFactory.createStrategy(
        gameType,
        config.scoringRules
      );

      // Apply any scoring rule overrides
      if (options.scoringOverrides) {
        scoringStrategy.updateScoringRules(options.scoringOverrides);
      }

      // 3. Create appropriate game instance
      let game: IGame;
      const GameClass = this.gameRegistry.get(gameType);
      
      if (GameClass) {
        // Use registered game class (specific implementation)
        console.log(`🎮 Using registered game class for type: ${gameType}`);
        game = new GameClass(gameId, config, scoringStrategy, options);
      } else {
        // Use generic implementation for unknown games
        console.log(`🔧 Using generic game implementation for unknown type: ${gameType}`);
        game = this.createGenericGame(gameId, config, scoringStrategy, options);
      }

      // 4. Cache instance if requested
      if (options.cacheInstance) {
        this.instanceCache.set(gameId, game);
      }

      console.log(`✅ Successfully created game: ${gameId}`);
      return game;

    } catch (error) {
      console.error(`❌ Failed to create game ${gameId}:`, error);
      throw new GameCreationError(`Failed to create game ${gameId}: ${error}`);
    }
  }

  /**
   * 🔧 Game Registry Management
   */
  registerGameType(gameType: string, gameClass: GameClass): void {
    console.log(`📋 Registering game type: ${gameType}`);
    this.gameRegistry.set(gameType, gameClass);
  }

  unregisterGameType(gameType: string): boolean {
    console.log(`🗑️ Unregistering game type: ${gameType}`);
    return this.gameRegistry.delete(gameType);
  }

  getRegisteredGameTypes(): string[] {
    return Array.from(this.gameRegistry.keys());
  }

  isGameTypeRegistered(gameType: string): boolean {
    return this.gameRegistry.has(gameType);
  }

  /**
   * 🎮 Game Discovery
   */
  async getAvailableGames(): Promise<GameDiscoveryResult[]> {
    try {
      const availableGameIds = await this.configManager.getAvailableGames();
      const results: GameDiscoveryResult[] = [];

      for (const gameId of availableGameIds) {
        try {
          const config = await this.configManager.loadConfig(gameId);
          const gameType = this.extractGameType(gameId);
          
          results.push({
            gameId,
            gameType,
            title: config.metadata.title,
            description: config.metadata.description,
            category: config.metadata.category,
            difficulty: config.metadata.difficulty,
            isRegistered: this.isGameTypeRegistered(gameType),
            hasCustomImplementation: this.gameRegistry.has(gameType),
            estimatedDuration: config.metadata.estimatedDuration,
            maxPlayers: config.metadata.maxPlayers,
            minPlayers: config.metadata.minPlayers,
            tags: config.metadata.tags
          });
        } catch (error) {
          console.warn(`Failed to load config for ${gameId}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to discover available games:', error);
      return [];
    }
  }

  /**
   * 🆕 Create New Game Type
   */
  async createNewGameType(
    gameType: string,
    template: Partial<GameConfig>,
    gameClass?: GameClass
  ): Promise<string> {
    const gameId = `${gameType}-${Date.now()}`;
    
    // Create configuration
    await this.configManager.initializeNewGame(gameId, template);
    
    // Register game class if provided
    if (gameClass) {
      this.registerGameType(gameType, gameClass);
    }

    console.log(`✅ Created new game type: ${gameType} with ID: ${gameId}`);
    return gameId;
  }

  /**
   * 🔄 Instance Management
   */
  getCachedInstance(gameId: string): IGame | null {
    return this.instanceCache.get(gameId) || null;
  }

  clearCache(): void {
    this.instanceCache.clear();
  }

  clearCacheFor(gameId: string): boolean {
    return this.instanceCache.delete(gameId);
  }

  getCachedGameIds(): string[] {
    return Array.from(this.instanceCache.keys());
  }

  /**
   * 🔧 Helper Methods
   */
  private extractGameType(gameId: string): string {
    // Extract game type from gameId (e.g., 'quiz-game-1' -> 'quiz')
    return gameId.split('-')[0] || 'generic';
  }

  private registerBuiltInGames(): void {
    // Built-in games will be registered here when they're implemented
    // For now, we'll register them when the specific game classes are created
    console.log('🏗️ Built-in game registration placeholder');
  }

  /**
   * 🆕 Generic Game Implementation
   * 
   * This creates a generic game instance for unknown game types
   */
  private createGenericGame(
    gameId: string,
    config: GameConfig,
    scoringStrategy: BaseScoringStrategy,
    options: GameCreationOptions = {}
  ): IGame {
    return new GenericGame(gameId, config, scoringStrategy, options);
  }

  /**
   * 🎯 Factory Statistics
   */
  getFactoryStats(): FactoryStats {
    return {
      registeredGameTypes: this.gameRegistry.size,
      cachedInstances: this.instanceCache.size,
      gameTypeList: this.getRegisteredGameTypes(),
      cachedGameIds: this.getCachedGameIds()
    };
  }
}

/**
 * 🎮 Game Creation Options
 * 
 * Options for customizing game creation
 */
export interface GameCreationOptions {
  // Configuration overrides
  configOverrides?: Partial<GameConfig>;
  scoringOverrides?: Record<string, number>;
  
  // Instance management
  cacheInstance?: boolean;
  
  // Custom options (passed to game constructor)
  customOptions?: Record<string, any>;
  
  // Player setup
  initialPlayers?: any[];
  
  // Feature flags
  enableAnalytics?: boolean;
  enableLogging?: boolean;
  
  // Development options
  debugMode?: boolean;
  mockData?: boolean;
}

/**
 * 🔍 Game Discovery Result
 * 
 * Information about an available game
 */
export interface GameDiscoveryResult {
  gameId: string;
  gameType: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isRegistered: boolean;
  hasCustomImplementation: boolean;
  estimatedDuration: number;
  maxPlayers: number;
  minPlayers: number;
  tags: string[];
}

/**
 * 📊 Factory Statistics
 * 
 * Statistics about the factory's current state
 */
export interface FactoryStats {
  registeredGameTypes: number;
  cachedInstances: number;
  gameTypeList: string[];
  cachedGameIds: string[];
}

/**
 * ❌ Game Creation Error
 * 
 * Error thrown when game creation fails
 */
export class GameCreationError extends Error {
  constructor(message: string, public gameId?: string) {
    super(message);
    this.name = 'GameCreationError';
  }
}

/**
 * 🆕 Generic Game Implementation
 * 
 * A universal game implementation that works for any unknown game type
 */
export class GenericGame implements IGame {
  public gameId: string;
  private config: GameConfig;
  private scoringStrategy: BaseScoringStrategy;
  private options: GameCreationOptions;
  private eventListeners: Map<string, Function[]> = new Map();
  private gameState: any = {};
  private players: any[] = [];
  private isInitialized = false;
  private isStarted = false;

  constructor(
    gameId: string,
    config: GameConfig,
    scoringStrategy: BaseScoringStrategy,
    options: GameCreationOptions = {}
  ) {
    this.gameId = gameId;
    this.config = config;
    this.scoringStrategy = scoringStrategy;
    this.options = options;

    console.log(`🎮 Creating generic game instance: ${gameId}`);
  }

  async initialize(): Promise<void> {
    console.log(`🔧 Initializing generic game: ${this.gameId}`);
    
    this.gameState = {
      status: 'ready',
      startTime: null,
      endTime: null,
      currentRound: 0,
      gameData: this.config.customConfig || {}
    };

    // Add initial players if provided
    if (this.options.initialPlayers) {
      this.players = [...this.options.initialPlayers];
    }

    this.isInitialized = true;
    this.emit('initialized', this.gameState);
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Game must be initialized before starting');
    }

    console.log(`🚀 Starting generic game: ${this.gameId}`);
    
    this.gameState.status = 'running';
    this.gameState.startTime = new Date();
    this.isStarted = true;
    
    this.emit('started', this.gameState);
  }

  pause(): void {
    if (this.isStarted) {
      this.gameState.status = 'paused';
      this.emit('paused', this.gameState);
    }
  }

  resume(): void {
    if (this.isStarted && this.gameState.status === 'paused') {
      this.gameState.status = 'running';
      this.emit('resumed', this.gameState);
    }
  }

  async end(): Promise<void> {
    console.log(`🏁 Ending generic game: ${this.gameId}`);
    
    this.gameState.status = 'ended';
    this.gameState.endTime = new Date();
    this.isStarted = false;
    
    this.emit('ended', this.gameState);
  }

  getScore(): number | Record<string, number> {
    // Return total score for single player, or score object for multiplayer
    if (this.players.length <= 1) {
      return this.gameState.score || 0;
    }
    
    const scores: Record<string, number> = {};
    this.players.forEach(player => {
      scores[player.id] = player.score || 0;
    });
    return scores;
  }

  getState(): any {
    return { ...this.gameState };
  }

  getMetadata(): any {
    return { ...this.config.metadata };
  }

  getPlayers(): any[] {
    return [...this.players];
  }

  addPlayer(player: any): boolean {
    if (this.players.length >= this.config.metadata.maxPlayers) {
      return false;
    }
    
    this.players.push(player);
    this.emit('playerAdded', { player, totalPlayers: this.players.length });
    return true;
  }

  removePlayer(playerId: string): boolean {
    const initialLength = this.players.length;
    this.players = this.players.filter(p => p.id !== playerId);
    
    if (this.players.length < initialLength) {
      this.emit('playerRemoved', { playerId, totalPlayers: this.players.length });
      return true;
    }
    
    return false;
  }

  async handlePlayerAction(action: any): Promise<any> {
    console.log(`🎯 Processing action in generic game: ${action.actionType}`);
    
    // Calculate score using strategy
    const score = this.scoringStrategy.calculateScore(action.actionType, action.context);
    
    // Update game state
    this.gameState.lastAction = action;
    this.gameState.lastScore = score;
    
    // Emit events
    this.emit('actionProcessed', { action, score });
    
    return {
      success: true,
      actionId: action.actionId,
      score,
      gameStateChanged: true,
      processedAt: new Date()
    };
  }

  validateAction(action: any): boolean {
    // Basic validation - can be overridden by specific games
    return action && action.actionType && action.playerId;
  }

  canStart(): boolean {
    return this.isInitialized && 
           this.players.length >= this.config.metadata.minPlayers &&
           this.players.length <= this.config.metadata.maxPlayers;
  }

  async serialize(): Promise<string> {
    return JSON.stringify({
      gameId: this.gameId,
      config: this.config,
      gameState: this.gameState,
      players: this.players,
      isInitialized: this.isInitialized,
      isStarted: this.isStarted
    });
  }

  async deserialize(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    this.gameState = parsed.gameState;
    this.players = parsed.players;
    this.isInitialized = parsed.isInitialized;
    this.isStarted = parsed.isStarted;
  }

  // Event system implementation
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
    } else {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }
}
