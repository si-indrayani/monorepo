// 🎮 Core Gaming SDK - Complete TRUE ARCHITECTURE Implementation
// 📍 Main entry point for the Gaming Platform SDK

// Core Gaming SDK - Main Entry Point

// Core Interfaces
export * from './interfaces/IGame';
export * from './interfaces/IPlayer';
export * from './interfaces/IGameEngine';

// Configuration System
export * from './config/GameConfig';

// Scoring Strategies
export * from './strategies/ScoringStrategy';

// Universal Game Factory
export * from './factories/UniversalGameFactory';

// BaseGame (explicit export for SDK consumers)
export * from './BaseGame';

// Game Engine
export * from './engines/GameEngine';

// Dynamic Game Discovery Service
export * from './services/DynamicGameDiscoveryService';

// GameDiscoveryClient - Legacy compatibility
export interface GameDiscoveryQuery {
  gameType?: string;
  category?: string;
  difficulty?: string;
}

export class GameDiscoveryClient {
  private apiEndpoint: string;
  
  constructor(apiEndpoint: string = 'https://api.games.platform.com') {
    this.apiEndpoint = apiEndpoint;
  }
  
  async discoverGames(gameType: string, query: GameDiscoveryQuery = {}): Promise<any[]> {
    console.log(`🔍 Legacy GameDiscoveryClient: discovering ${gameType} games`);
    
    return [{
      gameId: `${gameType}-game-1`,
      metadata: {
        title: `${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game`,
        description: `A ${gameType} game powered by TRUE ARCHITECTURE`,
        category: gameType,
        difficulty: 'medium',
        estimatedDuration: 10,
        maxPlayers: 4,
        minPlayers: 1,
        tags: [gameType, 'multiplayer'],
        version: '2.0.0'
      },
      scoringRules: { action: 10 },
      gameSettings: { timer: 30 }
    }];
  }
}

// Main SDK Class - The entry point for the entire platform
export default class CoreGamingSDK {
  private discoveryClient: GameDiscoveryClient;
  private gameEngine: import('./engines/GameEngine').GameEngine;
  
  constructor(apiEndpoint?: string) {
    this.discoveryClient = new GameDiscoveryClient(apiEndpoint);
    
    // Initialize the TRUE ARCHITECTURE game engine
    const { GameEngine } = require('./engines/GameEngine');
    this.gameEngine = new GameEngine();
    
    console.log('🚀 Core Gaming SDK initialized with TRUE ARCHITECTURE');
  }
  
  // Legacy compatibility
  getDiscoveryClient() {
    return this.discoveryClient;
  }
  
  // New TRUE ARCHITECTURE API
  getGameEngine() {
    return this.gameEngine;
  }
  
  // Quick initialization for development
  async initializeEngine(config?: any) {
    await this.gameEngine.initialize(config || {
      maxConcurrentSessions: 50,
      sessionTimeout: 30,
      autoCleanup: true,
      logLevel: 'info'
    });
    
    await this.gameEngine.start();
    console.log('✅ Game Engine started and ready for sessions');
    
    return this.gameEngine;
  }
  
  // Create a game session using the new architecture
  async createGameSession(gameType: string, options?: any) {
    if (!this.gameEngine.getEngineStatus().isRunning) {
      await this.initializeEngine();
    }
    
    return await this.gameEngine.createGameSession(gameType, undefined, options);
  }
  
  // Get available game types
  async getAvailableGameTypes() {
    return await this.gameEngine.getAvailableGameTypes();
  }
}

// Game Selector UI
export * from './GameSelector';

// Global Exposure for Plugin Architecture
// This makes the core SDK available globally for game plugins
import { Game, GameRegistry, GameSelector } from './GameSelector';
import { BaseScoringStrategy, ScoringAnalytics } from './strategies/ScoringStrategy';

// Expose globally if in browser environment
if (typeof window !== 'undefined') {
  (window as any).CoreGaming = (window as any).CoreGaming || {};
  (window as any).CoreGaming.Game = Game;
  (window as any).CoreGaming.GameRegistry = GameRegistry;
  (window as any).CoreGaming.GameSelector = GameSelector;
  (window as any).CoreGaming.BaseScoringStrategy = BaseScoringStrategy;
  (window as any).CoreGaming.ScoringAnalytics = ScoringAnalytics;

  // Create and expose a global registry instance
  (window as any).CoreGaming.RegistryInstance = new GameRegistry();

  console.log('🎮 Core Gaming SDK exposed globally as window.CoreGaming');
}
