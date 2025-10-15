// 📍 Location: src/config/GameConfig.ts
// 🎯 Purpose: Manages ALL game configurations universally
// 🔗 Used by: Factory, all games, scoring strategies

import { GameMetadata } from '../interfaces/IGame';

// Utility type for deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 🎮 Universal Game Configuration
 * 
 * This is the master configuration interface that works for ALL games
 */
export interface GameConfig {
  // Core identification
  gameId: string;
  gameType: string;
  
  // Game information
  metadata: GameMetadata;
  
  // Universal scoring system
  scoringRules: Record<string, number>;
  
  // Universal game rules
  gameRules: GameRules;
  
  // UI configuration
  ui: UIConfig;
  
  // Data storage configuration
  storage: StorageConfig;
  
  // Features and capabilities
  features: GameFeatures;
  
  // Version and compatibility
  version: string;
  minEngineVersion: string;
  
  // Custom game-specific configuration
  customConfig?: Record<string, any>;
}

/**
 * 📋 Game Rules Configuration
 * 
 * Universal rule system that adapts to any game type
 */
export interface GameRules {
  // Time limits
  timeLimit?: number; // Total game time in seconds
  turnTimeLimit?: number; // Time per turn/question
  
  // Player limits
  minPlayers: number;
  maxPlayers: number;
  
  // Game flow
  rounds?: number;
  autoStart: boolean;
  autoEnd: boolean;
  pauseAllowed: boolean;
  
  // Difficulty settings
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'custom';
  adaptiveDifficulty: boolean;
  
  // Validation rules
  preventCheating: boolean;
  requireValidation: boolean;
  
  // Custom rules (game-specific)
  customRules?: Record<string, any>;
}

/**
 * 🎨 UI Configuration
 * 
 * Controls how the game appears and behaves in the UI
 */
export interface UIConfig {
  // Theme and appearance
  theme: 'light' | 'dark' | 'auto' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  
  // Layout
  layout: 'standard' | 'compact' | 'fullscreen' | 'custom';
  showScore: boolean;
  showTimer: boolean;
  showProgress: boolean;
  
  // Interaction
  soundEnabled: boolean;
  animationsEnabled: boolean;
  hapticFeedback: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  
  // Custom UI elements
  customElements?: Record<string, any>;
}

/**
 * 💾 Storage Configuration
 * 
 * Controls how game data is stored and retrieved
 */
export interface StorageConfig {
  // Storage type
  storageType: 'local' | 'session' | 'remote' | 'hybrid';
  
  // Data persistence
  saveGameState: boolean;
  savePlayerProgress: boolean;
  saveScores: boolean;
  
  // Remote storage (if applicable)
  apiEndpoint?: string;
  apiKey?: string;
  
  // Data retention
  retentionPeriod?: number; // in days
  autoCleanup: boolean;
  
  // Encryption
  encryptData: boolean;
  encryptionKey?: string;
}

/**
 * 🚀 Game Features
 * 
 * Defines what features the game supports
 */
export interface GameFeatures {
  // Core features
  singlePlayer: boolean;
  multiPlayer: boolean;
  realTime: boolean;
  turnBased: boolean;
  
  // Advanced features
  tournaments: boolean;
  leaderboards: boolean;
  achievements: boolean;
  socialFeatures: boolean;
  
  // Integration features
  analytics: boolean;
  crashReporting: boolean;
  cloudSync: boolean;
  offlineMode: boolean;
  
  // Customization
  customizable: boolean;
  moddingSupport: boolean;
  
  // Accessibility
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
}

/**
 * ⚙️ Game Configuration Manager
 * 
 * Central hub for managing all game configurations
 */
export class GameConfigManager {
  private configCache: Map<string, GameConfig> = new Map();
  private configDirectory: string;
  private defaultConfigs: Map<string, DeepPartial<GameConfig>> = new Map();

  constructor(configDirectory: string = './config') {
    this.configDirectory = configDirectory;
    this.initializeDefaultConfigs();
  }

  /**
   * 📋 Core Configuration Methods
   */

  // 1. Load configuration (JSON file or create default)
  async loadConfig(gameId: string): Promise<GameConfig> {
    // Check cache first
    if (this.configCache.has(gameId)) {
      return this.configCache.get(gameId)!;
    }

    try {
      // Try to load from file system
      const config = await this.loadConfigFromFile(gameId);
      this.configCache.set(gameId, config);
      return config;
    } catch (error) {
      // File doesn't exist or is invalid, create default
      console.log(`Creating default configuration for game: ${gameId}`);
      const defaultConfig = await this.createDefaultConfig(gameId);
      await this.saveConfig(gameId, defaultConfig);
      return defaultConfig;
    }
  }

  // 2. Save configuration back to file
  async saveConfig(gameId: string, config: GameConfig): Promise<void> {
    try {
      // Update cache
      this.configCache.set(gameId, config);
      
      // Save to file system
      await this.saveConfigToFile(gameId, config);
      
      console.log(`Configuration saved for game: ${gameId}`);
    } catch (error) {
      console.error(`Failed to save configuration for ${gameId}:`, error);
      throw new Error(`Configuration save failed: ${error}`);
    }
  }

  // 3. Update specific rules dynamically
  async updateScoringRule(gameId: string, rule: string, value: number): Promise<void> {
    const config = await this.loadConfig(gameId);
    config.scoringRules[rule] = value;
    await this.saveConfig(gameId, config);
  }

  async updateGameRule(gameId: string, rule: string, value: any): Promise<void> {
    const config = await this.loadConfig(gameId);
    if (config.gameRules.customRules) {
      config.gameRules.customRules[rule] = value;
    } else {
      config.gameRules.customRules = { [rule]: value };
    }
    await this.saveConfig(gameId, config);
  }

  // 4. Discover all available games
  async getAvailableGames(): Promise<string[]> {
    try {
      // In a real implementation, this would scan the config directory
      // For now, return cached games + default game types
      const cachedGames = Array.from(this.configCache.keys());
      const defaultGames = Array.from(this.defaultConfigs.keys());
      
      const uniqueGames = new Set([...cachedGames, ...defaultGames]);
      return Array.from(uniqueGames);
    } catch (error) {
      console.error('Failed to discover available games:', error);
      return [];
    }
  }

  // 5. Create new game configurations
  async initializeNewGame(gameId: string, options: Partial<GameConfig> = {}): Promise<GameConfig> {
    const defaultConfig = await this.createDefaultConfig(gameId);
    
    // Merge with provided options
    const newConfig: GameConfig = {
      ...defaultConfig,
      ...options,
      gameId, // Ensure gameId is correct
      metadata: {
        ...defaultConfig.metadata,
        ...options.metadata
      },
      gameRules: {
        ...defaultConfig.gameRules,
        ...options.gameRules
      },
      ui: {
        ...defaultConfig.ui,
        ...options.ui
      },
      storage: {
        ...defaultConfig.storage,
        ...options.storage
      },
      features: {
        ...defaultConfig.features,
        ...options.features
      }
    };

    await this.saveConfig(gameId, newConfig);
    return newConfig;
  }

  /**
   * 🔧 Helper Methods
   */

  private async createDefaultConfig(gameId: string): Promise<GameConfig> {
    // Check if we have a default config for this game type
    const gameType = this.extractGameType(gameId);
    const defaultTemplate = this.defaultConfigs.get(gameType);

    return {
      gameId,
      gameType,
      version: '1.0.0',
      minEngineVersion: '1.0.0',
      
      metadata: {
        title: this.formatGameTitle(gameId),
        description: `A ${gameType} game`,
        category: gameType,
        difficulty: 'medium',
        estimatedDuration: 10,
        maxPlayers: 4,
        minPlayers: 1,
        tags: [gameType || 'unknown', 'multiplayer'],
        version: '1.0.0',
        ...defaultTemplate?.metadata
      },

      scoringRules: {
        baseScore: 10,
        bonusMultiplier: 1.5,
        penaltyDeduction: 5,
        ...defaultTemplate?.scoringRules
      },

      gameRules: {
        minPlayers: 1,
        maxPlayers: 4,
        autoStart: false,
        autoEnd: true,
        pauseAllowed: true,
        difficulty: 'medium',
        adaptiveDifficulty: false,
        preventCheating: true,
        requireValidation: false,
        ...defaultTemplate?.gameRules
      },

      ui: {
        theme: 'auto',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        layout: 'standard',
        showScore: true,
        showTimer: true,
        showProgress: true,
        soundEnabled: true,
        animationsEnabled: true,
        hapticFeedback: false,
        highContrast: false,
        largeText: false,
        screenReader: false,
        ...defaultTemplate?.ui
      },

      storage: {
        storageType: 'local',
        saveGameState: true,
        savePlayerProgress: true,
        saveScores: true,
        autoCleanup: false,
        encryptData: false,
        ...defaultTemplate?.storage
      },

      features: {
        singlePlayer: true,
        multiPlayer: true,
        realTime: false,
        turnBased: true,
        tournaments: false,
        leaderboards: true,
        achievements: false,
        socialFeatures: false,
        analytics: true,
        crashReporting: true,
        cloudSync: false,
        offlineMode: true,
        customizable: false,
        moddingSupport: false,
        screenReaderSupport: false,
        keyboardNavigation: true,
        colorBlindSupport: false,
        ...defaultTemplate?.features
      },

      customConfig: defaultTemplate?.customConfig || {}
    };
  }

  private extractGameType(gameId: string): string {
    // Extract game type from gameId (e.g., 'quiz-game-1' -> 'quiz')
    return gameId.split('-')[0] || 'generic';
  }

  private formatGameTitle(gameId: string): string {
    return gameId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async loadConfigFromFile(gameId: string): Promise<GameConfig> {
    // In a real implementation, this would read from the file system
    // For now, simulate file loading
    const filePath = `${this.configDirectory}/${gameId}.json`;
    
    // Simulate file system access
    throw new Error(`Configuration file not found: ${filePath}`);
  }

  private async saveConfigToFile(gameId: string, config: GameConfig): Promise<void> {
    // In a real implementation, this would write to the file system
    // For now, just log the action
    console.log(`Simulating save of config for ${gameId} to ${this.configDirectory}/${gameId}.json`);
  }

  private initializeDefaultConfigs(): void {
    // Quiz game defaults - using DeepPartial to override only specific properties
    this.defaultConfigs.set('quiz', {
      scoringRules: {
        correctAnswer: 10,
        wrongAnswer: 0,
        speedBonus: 5,
        streakBonus: 2
      },
      gameRules: {
        timeLimit: 300, // 5 minutes
        turnTimeLimit: 30, // 30 seconds per question
        customRules: {
          questionsCount: 10,
          shuffleQuestions: true,
          shuffleOptions: true
        }
      }
    });

    // Cricket game defaults
    this.defaultConfigs.set('cricket', {
      scoringRules: {
        run: 1,
        boundary: 4,
        six: 6,
        wicket: 10,
        century: 50
      },
      gameRules: {
        customRules: {
          overs: 20,
          playersPerTeam: 11,
          powerPlayOvers: 6
        }
      }
    });

    // Football game defaults
    this.defaultConfigs.set('football', {
      scoringRules: {
        goal: 1,
        assist: 0.5,
        cleanSheet: 0.5,
        yellowCard: -0.2,
        redCard: -0.5
      }
    });
  }

  /**
   * 🚀 Advanced Configuration Features
   */

  // Get configuration schema for validation
  getConfigSchema(): any {
    return {
      type: 'object',
      required: ['gameId', 'gameType', 'metadata', 'scoringRules', 'gameRules'],
      properties: {
        gameId: { type: 'string' },
        gameType: { type: 'string' },
        metadata: { type: 'object' },
        scoringRules: { type: 'object' },
        gameRules: { type: 'object' },
        ui: { type: 'object' },
        storage: { type: 'object' },
        features: { type: 'object' }
      }
    };
  }

  // Validate configuration
  validateConfig(config: GameConfig): boolean {
    try {
      // Basic validation
      if (!config.gameId || !config.gameType) return false;
      if (!config.metadata || !config.scoringRules || !config.gameRules) return false;
      
      // More detailed validation could be added here
      return true;
    } catch (error) {
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    this.configCache.clear();
  }

  // Get cached configurations
  getCachedConfigs(): string[] {
    return Array.from(this.configCache.keys());
  }
}
