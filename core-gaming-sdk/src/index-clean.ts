// 🎮 Core Gaming SDK - TRUE ARCHITECTURE Implementation
// 📍 Main entry point for the Gaming Platform SDK

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

// Game Engine
export * from './engines/GameEngine';

// Dynamic Game Discovery Service
export * from './services/DynamicGameDiscoveryService';

// Legacy compatibility exports
export interface GameDiscoveryQuery {
  gameType?: string;
  category?: string;
  difficulty?: string;
}

export class GameDiscoveryClient {
  constructor(private apiEndpoint: string = 'https://api.games.platform.com') {}

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
